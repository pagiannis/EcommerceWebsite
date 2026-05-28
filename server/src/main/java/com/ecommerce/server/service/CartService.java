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
import com.ecommerce.server.security.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
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
    @Transactional(readOnly = true)
    public List<CartItemResponse> getUserCart(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

     // Προσθήκη προϊόντος στο καλάθι
     @Transactional
     public CartItemResponse addToCart(Long userId, CartItemRequest request) {
         User user = userRepository.findById(userId)
                 .orElseThrow(() -> new ResourceNotFoundException("User not found"));

         ProductVariant variant = productVariantRepository.findById(request.variantId())
                 .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

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
             return toResponse(cartItemRepository.save(existingItem));
         }

         // Δημιουργία νέου cart item
         CartItem cartItem = CartItem.builder()
                 .user(user)
                 .variant(variant)
                 .quantity(request.quantity())
                 .build();

         return toResponse(cartItemRepository.save(cartItem));
     }

     // Παρότι ο controller επιβάλλει @Min(1), κρατάμε
     // και service-level guard ώστε η μέθοδος να είναι ασφαλής σε όποιον
     // καλεστή — άλλο service, scheduled job ή μελλοντικό endpoint χωρίς
     // bean validation. Ίδιο pattern με το addToCart παραπάνω.
     @Transactional
     public CartItemResponse updateQuantity(Long cartItemId, Integer quantity) {
         CartItem cartItem = cartItemRepository.findById(cartItemId)
                 .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
         requireCartItemOwner(cartItem);

         if (quantity <= 0) {
             throw new BadRequestException("Quantity must be greater than 0");
         }

         ProductVariant variant = cartItem.getVariant();
         if (quantity > variant.getStockQuantity()) {
             throw new BadRequestException("Requested quantity exceeds available stock. Available: " + variant.getStockQuantity());
         }

         cartItem.setQuantity(quantity);
         return toResponse(cartItemRepository.save(cartItem));
     }

    // Αφαίρεση προϊόντος από καλάθι
    @Transactional
    public void removeFromCart(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        requireCartItemOwner(cartItem);
        cartItemRepository.delete(cartItem);
    }

    // Αποκαθάρισή καλαθιού χρήστη
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private void requireCartItemOwner(CartItem cartItem) {
        // Σύγκριση με id αντί email: αν ο user αλλάξει email όσο είναι
        // logged-in, η session κρατά το παλιό όνομα — με email-based check
        // θα έπαιρνε 403 για τα δικά του cart items. Το id δεν αλλάζει.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser user)
                || !cartItem.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
    }

    // Ownership check για χρήση από @PreAuthorize SpEL:
    //   @PreAuthorize("@cartService.isCartItemOwner(#cartItemId)")
    @Transactional(readOnly = true)
    public boolean isCartItemOwner(Long cartItemId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUser user)) {
            return false;
        }
        return cartItemRepository.findById(cartItemId)
                .map(ci -> ci.getUser().getId().equals(user.getId()))
                .orElse(false);
    }

    // Μετατροπή CartItem Entity σε CartItemResponse DTO
    private CartItemResponse toResponse(CartItem item) {
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

