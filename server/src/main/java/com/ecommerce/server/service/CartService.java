package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.models.CartItem;
import com.ecommerce.server.models.ProductVariant;
import com.ecommerce.server.models.User;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.CartItemRepository;
import com.ecommerce.server.repository.ProductVariantRepository;
import com.ecommerce.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;


    // Λήψη καλαθιού χρήστη
    public List<CartItemResponse> getUserCart(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

     // Προσθήκη προϊόντος στο καλάθι
     @Transactional
     public CartItemResponse addToCart(Long userId, CartItemRequest request) {
         User user = userRepository.findById(userId)
                 .orElseThrow(() -> new RuntimeException("User not found"));

         ProductVariant variant = productVariantRepository.findById(request.variantId())
                 .orElseThrow(() -> new RuntimeException("Variant not found"));

         // Έλεγχος αν η ζητούμενη ποσότητα είναι διαθέσιμη
         if (request.quantity() <= 0) {
             throw new BadRequestException("Quantity must be greater than 0");
         }

         if (request.quantity() > variant.getStockQuantity()) {
             throw new BadRequestException("Requested quantity exceeds available stock. Available: " + variant.getStockQuantity());
         }

         // Έλεγχος αν υπάρχει ήδη στο καλάθι
         CartItem existingItem = cartItemRepository.findByUserIdAndVariantId(userId, request.variantId())
                 .orElse(null);

         if (existingItem != null) {
             // Αν υπάρχει ήδη, ελέγχουμε αν η νέα συνολική ποσότητα δεν υπερβαίνει το stock
             int newQuantity = existingItem.getQuantity() + request.quantity();
             if (newQuantity > variant.getStockQuantity()) {
                 throw new BadRequestException("Total quantity exceeds available stock. Available: " + variant.getStockQuantity());
             }
             existingItem.setQuantity(newQuantity);
             return convertToResponse(cartItemRepository.save(existingItem));
         }

         // Δημιουργία νέου cart item
         CartItem cartItem = CartItem.builder()
                 .user(user)
                 .variant(variant)
                 .quantity(request.quantity())
                 .build();

         return convertToResponse(cartItemRepository.save(cartItem));
     }

     // Ενημέρωση ποσότητας
     @Transactional
     public CartItemResponse updateQuantity(Long cartItemId, Integer quantity) {
         CartItem cartItem = cartItemRepository.findById(cartItemId)
                 .orElseThrow(() -> new RuntimeException("Cart item not found"));
         requireCartItemOwner(cartItem);

         if (quantity <= 0) {
             cartItemRepository.delete(cartItem);
             throw new BadRequestException("Quantity must be greater than 0");
         }

         // Έλεγχος αν η νέα ποσότητα υπερβαίνει το stock
         ProductVariant variant = cartItem.getVariant();
         if (quantity > variant.getStockQuantity()) {
             throw new BadRequestException("Requested quantity exceeds available stock. Available: " + variant.getStockQuantity());
         }

         cartItem.setQuantity(quantity);
         return convertToResponse(cartItemRepository.save(cartItem));
     }

    // Αφαίρεση προϊόντος από καλάθι
    @Transactional
    public void removeFromCart(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        requireCartItemOwner(cartItem);
        cartItemRepository.delete(cartItem);
    }

    // Αποκαθάρισή καλαθιού χρήστη
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private void requireCartItemOwner(CartItem cartItem) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!cartItem.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Access denied");
        }
    }

    // Μετατροπή CartItem Entity σε CartItemResponse DTO
    private CartItemResponse convertToResponse(CartItem item) {
        ProductVariant variant = item.getVariant();
        return new CartItemResponse(
                item.getId(),
                variant.getId(),
                variant.getProduct().getName(),
                variant.getColor().toString(),
                variant.getSize().toString(),
                item.getQuantity(),
                variant.getProduct().getPrice(),
                variant.getProduct().getPrice()
                        .multiply(java.math.BigDecimal.valueOf(item.getQuantity()))
        );
    }
}

