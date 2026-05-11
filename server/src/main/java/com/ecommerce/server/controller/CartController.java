package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Validated
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<List<CartItemResponse>> getUserCart(@PathVariable Long userId){
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @PostMapping("/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<CartItemResponse> addToCart(@PathVariable Long userId, @Valid @RequestBody CartItemRequest request){
        CartItemResponse result = cartService.addToCart(userId, request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping("/{cartItemId}")
    @PreAuthorize("@cartService.isCartItemOwner(#cartItemId)")
    public ResponseEntity<CartItemResponse> updateQuantity(@PathVariable Long cartItemId,
                                                           @RequestParam @Min(value = 1, message = "Quantity must be at least 1") int quantity){
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    @PreAuthorize("@cartService.isCartItemOwner(#cartItemId)")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId){
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }
}
