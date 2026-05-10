package com.ecommerce.server.service;

import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.dto.request.UserRegistrationRequest;
import com.ecommerce.server.dto.request.UserRequest;
import com.ecommerce.server.dto.response.UserResponse;
import com.ecommerce.server.models.User;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.UserRepository;
import com.ecommerce.server.security.AuthUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Καλείται αυτόματα από το Spring Security κατά το login.
    // Παίρνει το email, φορτώνει τον user από τη βάση και επιστρέφει
    // ένα UserDetails object που το Spring Security χρησιμοποιεί για
    // να συγκρίνει τον κωδικό και να φτιάξει το Authentication object.
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        // AuthUser αντί για default Spring User: εκθέτει το id ώστε το
        // @PreAuthorize("#userId == authentication.principal.id") να δουλεύει.
        return new AuthUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return toResponse(user);
    }

    public UserResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password())) // κωδικός αποθηκεύεται πάντα hashed
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();

        return toResponse(userRepository.save(user));
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ConflictException("Email already in use: " + request.email());
            }
            user.setEmail(request.email());
        }
        if (request.firstName() != null) user.setFirstName(request.firstName());
        if (request.lastName() != null) user.setLastName(request.lastName());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.password() != null) user.setPasswordHash(passwordEncoder.encode(request.password())); // hash πριν αποθήκευση

        user.setUpdatedAt(LocalDateTime.now());

        return toResponse(userRepository.save(user));
    }

    // --- Admin methods ---

    public UserResponse changeUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRole(role);
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(userRepository.save(user));
    }

    public UserResponse adminUpdateUser(Long id, UserRequest request) {
        return updateUser(id, request);
    }

    public void adminDeleteUser(Long id) {
        deleteUser(id);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
