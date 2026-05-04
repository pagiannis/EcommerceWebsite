package com.ecommerce.server.service;

import com.ecommerce.server.models.User;
import com.ecommerce.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Create a test user
    public User createTestUser(String email) {
        User user = User.builder()
                .email(email)
                .passwordHash("hashedPassword123")
                .firstName("Test")
                .lastName("User")
                .phone("1234567890")
                .build();

        return userRepository.save(user);
    }

    // Get user by ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

