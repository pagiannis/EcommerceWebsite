package com.ecommerce.server.controller;

import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.dto.response.WishlistItemResponse;
import com.ecommerce.server.service.WishlistService;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Validated
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponse>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Boolean> isInWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.isInWishlist(userId, productId));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItemResponse> addToWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        return new ResponseEntity<>(wishlistService.addToWishlist(userId, productId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long userId, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/move-to-cart")
    public ResponseEntity<CartItemResponse> moveToCart(@PathVariable Long userId,
                                                       @PathVariable Long productId,
                                                       @RequestParam Long variantId,
                                                       @RequestParam(defaultValue = "1") @Min(value = 1, message = "Quantity must be at least 1") int quantity) {
        return ResponseEntity.ok(wishlistService.moveToCart(userId, productId, variantId, quantity));
    }
}
