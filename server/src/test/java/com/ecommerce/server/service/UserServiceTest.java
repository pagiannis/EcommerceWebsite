package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.UserRegistrationRequest;
import com.ecommerce.server.dto.response.UserResponse;
import com.ecommerce.server.exception.ConflictException;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.repository.UserRepository;
import com.ecommerce.server.security.AuthUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το UserService.
 *
 * - @ExtendWith(MockitoExtension.class): ενεργοποιεί το Mockito ώστε
 *   τα @Mock / @InjectMocks να γίνουν initialize πριν από κάθε test.
 * - Δεν φορτώνεται Spring context εδώ — είναι pure unit test.
 *   Γρήγορο (ms), χωρίς βάση, χωρίς web server.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserRegistrationRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new UserRegistrationRequest(
                "new@test.com",
                "password123",
                "Γιώργος",
                "Παπαδόπουλος",
                "6900000000"
        );
    }

    // ---------- registerUser ----------

    @Test
    @DisplayName("registerUser: με νέο email αποθηκεύει χρήστη και επιστρέφει response")
    void registerUser_withNewEmail_savesAndReturnsResponse() {
        // ARRANGE — στήσιμο των mocks
        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("HASHED_PW");
        // Το save() επιστρέφει τον user που του δίνουμε, αλλά με id=1L
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        // ACT
        UserResponse response = userService.registerUser(validRequest);

        // ASSERT — το response έχει τα σωστά πεδία
        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("new@test.com");
        assertThat(response.firstName()).isEqualTo("Γιώργος");
        assertThat(response.lastName()).isEqualTo("Παπαδόπουλος");
        assertThat(response.role()).isEqualTo(Role.USER); // default από τον builder
    }

    @Test
    @DisplayName("registerUser: ποτέ δεν αποθηκεύει τον raw κωδικό — μόνο το hash")
    void registerUser_hashesPasswordBeforeSaving() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("HASHED_PW");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.registerUser(validRequest);

        // ArgumentCaptor: "πιάνει" το User object που πέρασε στο save()
        // για να το ελέγξουμε από κοντά.
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertThat(saved.getPasswordHash()).isEqualTo("HASHED_PW");
        assertThat(saved.getPasswordHash()).isNotEqualTo("password123"); // ποτέ raw!
    }

    @Test
    @DisplayName("registerUser: με υπάρχον email πετάει ConflictException και δεν αποθηκεύει")
    void registerUser_withExistingEmail_throwsConflict() {
        when(userRepository.existsByEmail("new@test.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.registerUser(validRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already in use");

        // Επιβεβαιώνουμε ότι ΔΕΝ έγινε save — σημαντικό για data integrity
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    // ---------- getUserById ----------

    @Test
    @DisplayName("getUserById: όταν βρεθεί, επιστρέφει UserResponse")
    void getUserById_whenFound_returnsResponse() {
        User user = User.builder()
                .id(42L)
                .email("found@test.com")
                .firstName("Άννα")
                .lastName("Δήμου")
                .role(Role.USER)
                .build();
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));

        UserResponse response = userService.getUserById(42L);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.email()).isEqualTo("found@test.com");
    }

    @Test
    @DisplayName("getUserById: όταν δεν βρεθεί, πετάει ResourceNotFoundException")
    void getUserById_whenNotFound_throws() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // ---------- deleteUser ----------

    @Test
    @DisplayName("deleteUser: όταν υπάρχει, καλεί το deleteById")
    void deleteUser_whenExists_callsRepository() {
        when(userRepository.existsById(5L)).thenReturn(true);

        userService.deleteUser(5L);

        verify(userRepository).deleteById(5L);
    }

    @Test
    @DisplayName("deleteUser: όταν δεν υπάρχει, πετάει ResourceNotFoundException και δεν διαγράφει")
    void deleteUser_whenNotFound_throws() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(999L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).deleteById(anyLong());
    }

    // ---------- loadUserByUsername (Spring Security) ----------

    @Test
    @DisplayName("loadUserByUsername: επιστρέφει AuthUser με authority ROLE_USER")
    void loadUserByUsername_whenFound_returnsAuthUserWithRolePrefix() {
        User user = User.builder()
                .id(7L)
                .email("login@test.com")
                .passwordHash("HASH")
                .role(Role.USER)
                .build();
        when(userRepository.findByEmail("login@test.com")).thenReturn(Optional.of(user));

        UserDetails details = userService.loadUserByUsername("login@test.com");

        assertThat(details).isInstanceOf(AuthUser.class);
        assertThat(details.getUsername()).isEqualTo("login@test.com");
        assertThat(details.getPassword()).isEqualTo("HASH");
        // Το Spring Security περιμένει το prefix "ROLE_" στις authorities
        assertThat(details.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("loadUserByUsername: αν δεν βρεθεί ο user, πετάει UsernameNotFoundException")
    void loadUserByUsername_whenNotFound_throws() {
        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.loadUserByUsername("ghost@test.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("ghost@test.com");
    }
}