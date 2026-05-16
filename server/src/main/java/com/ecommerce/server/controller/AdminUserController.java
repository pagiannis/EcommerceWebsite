package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.UserRequest;
import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.dto.response.UserResponse;
import com.ecommerce.server.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Validated
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(userService.getAllUsers(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                   @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.adminUpdateUser(id, request));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeRole(@PathVariable Long id,
                                                   @RequestParam Role role) {
        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.adminDeleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
