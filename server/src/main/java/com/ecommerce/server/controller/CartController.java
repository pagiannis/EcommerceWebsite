package com.ecommerce.server.controller;


import com.ecommerce.server.dto.request.CartItemRequest;
import com.ecommerce.server.dto.response.CartItemResponse;
import com.ecommerce.server.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemResponse>> getUserCart(@PathVariable Long userId){
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<CartItemResponse> addToCart(@PathVariable Long userId, @RequestBody CartItemRequest request){
        CartItemResponse result = cartService.addToCart(userId, request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponse> updateQuantity(@PathVariable Long cartItemId, @RequestParam int quantity){
        return ResponseEntity.ok(cartService.updateQuantity(cartItemId, quantity));
    }
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId){
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

}
