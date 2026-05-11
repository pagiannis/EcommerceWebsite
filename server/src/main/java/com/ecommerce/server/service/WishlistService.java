package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.dto.response.WishlistItemResponse;
import com.ecommerce.server.models.Product;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.WishlistItem;
import com.ecommerce.server.exception.BadRequestException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.ProductRepository;
import com.ecommerce.server.repository.UserRepository;
import com.ecommerce.server.repository.WishlistItemRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    public WishlistService(WishlistItemRepository wishlistItemRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         @Lazy CartService cartService) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
    }

    /**
     * Λήψη wishlist χρήστη
     */
    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getUserWishlist(Long userId) {
        return wishlistItemRepository.findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Προσθήκη προϊόντος στα αγαπημένα
     */
    @Transactional
    public WishlistItemResponse addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Έλεγχος αν υπάρχει ήδη
        if (wishlistItemRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new BadRequestException("Product already in wishlist");
        }

        WishlistItem wishlistItem = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        return convertToResponse(wishlistItemRepository.save(wishlistItem));
    }

    /**
     * Αφαίρεση προϊόντος από αγαπημένα
     */
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        WishlistItem wishlistItem = wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));
        wishlistItemRepository.delete(wishlistItem);
    }

    /**
     * Έλεγχος αν προϊόν είναι στα αγαπημένα
     */
    @Transactional(readOnly = true)
    public Boolean isInWishlist(Long userId, Long productId) {
        return wishlistItemRepository.findByUserIdAndProductId(userId, productId).isPresent();
    }

    /**
     * Μεταφορά προϊόντος από wishlist στο καλάθι
     */
    @Transactional
    public CartItemResponse moveToCart(Long userId, Long productId, Long variantId, int quantity) {
        wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        CartItemResponse response = cartService.addToCart(userId, new CartItemRequest(variantId, quantity));
        removeFromWishlist(userId, productId);
        return response;
    }

    // Μετατροπή WishlistItem Entity σε WishlistItemResponse DTO
    private WishlistItemResponse convertToResponse(WishlistItem item) {
        Product product = item.getProduct();
        String imageUrl = product.getImages().isEmpty() 
                ? null 
                : product.getImages().get(0).getImageUrl();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String addedAt = item.getAddedAt().format(formatter);

        return new WishlistItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                imageUrl,
                product.getBrand().getName(),
                product.getPrice(),
                addedAt
        );
    }
}

