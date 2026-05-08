package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.AddressRequest;
import com.ecommerce.server.dto.response.AddressResponse;
import com.ecommerce.server.service.AddressService;
import com.ecommerce.server.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getUserAddresses(@PathVariable Long userId) {
        userService.requireSelf(userId);
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(@PathVariable Long userId,
                                                      @Valid @RequestBody AddressRequest request) {
        userService.requireSelf(userId);
        return new ResponseEntity<>(addressService.addAddress(userId, request), HttpStatus.CREATED);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable Long userId,
                                                         @PathVariable Long addressId,
                                                         @Valid @RequestBody AddressRequest request) {
        userService.requireSelf(userId);
        return ResponseEntity.ok(addressService.updateAddress(addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long userId,
                                              @PathVariable Long addressId) {
        userService.requireSelf(userId);
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{addressId}/default")
    public ResponseEntity<AddressResponse> setDefault(@PathVariable Long userId,
                                                      @PathVariable Long addressId) {
        userService.requireSelf(userId);
        return ResponseEntity.ok(addressService.setDefault(userId, addressId));
    }
}
