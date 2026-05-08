package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.LoginRequest;
import com.ecommerce.server.dto.request.UserRegistrationRequest;
import com.ecommerce.server.dto.request.UserRequest;
import com.ecommerce.server.dto.response.UserResponse;
import com.ecommerce.server.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest) {
        // Ελέγχει email + password μέσω του UserService.loadUserByUsername() και BCrypt.
        // Αν είναι λάθος, πετάει BadCredentialsException → 401.
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // Session fixation protection: αν υπάρχει ήδη session, την ακυρώνουμε ώστε
        // ο authenticated user να πάρει νέο session ID (αλλιώς ένας attacker που
        // έδωσε γνωστό session ID στο θύμα θα μοιραζόταν το authenticated session).
        HttpSession existing = httpRequest.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }

        // Αποθηκεύει το αποτέλεσμα του authentication στο SecurityContext (in-memory για το τρέχον request).
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        // Δημιουργεί HTTP session και αποθηκεύει το SecurityContext σε αυτό.
        // Το Spring Session JDBC αναλαμβάνει να το persist-άρει στη βάση.
        // Ο browser λαμβάνει αυτόματα το SESSION cookie στο response.
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        return ResponseEntity.ok(userService.getUserByEmail(request.email()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        // Διαγράφει το session από τη βάση και καθαρίζει το SecurityContext.
        // Το SESSION cookie στον browser γίνεται άκυρο.
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        return new ResponseEntity<>(userService.registerUser(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        userService.requireSelf(id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                                   @Valid @RequestBody UserRequest request) {
        userService.requireSelf(id);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.requireSelf(id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}