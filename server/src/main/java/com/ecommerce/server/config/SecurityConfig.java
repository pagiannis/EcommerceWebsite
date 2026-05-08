package com.ecommerce.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Ο αλγόριθμος που κάνει hash τους κωδικούς. Χρησιμοποιείται στο register,
    // στο update password, και αυτόματα από το Spring Security στο login για σύγκριση.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Το κεντρικό component που επαληθεύει credentials (email + password).
    // Χρησιμοποιεί το UserService.loadUserByUsername() + PasswordEncoder.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Ενεργοποιεί CORS με τους κανόνες του corsConfigurationSource() παρακάτω.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // CSRF απενεργοποιημένο — δεν χρειάζεται σε REST API με session cookies
            // που καλείται από γνωστό frontend (localhost:5173).
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints — δεν απαιτούν login.
                .requestMatchers(HttpMethod.POST, "/api/users/login", "/api/users/register", "/api/users/logout").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/api/products/**", "/api/categories/**",
                        "/api/reviews/**", "/api/app-reviews/**").permitAll()
                // Μόνο ADMIN — αν ο user έχει ROLE_USER θα λάβει 403.
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Οτιδήποτε άλλο (cart, orders, wishlist, addresses) απαιτεί login.
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                // Αν ο user δεν είναι logged in → 401 Unauthorized
                .authenticationEntryPoint((req, res, e) ->
                        res.sendError(HttpStatus.UNAUTHORIZED.value(), "Unauthorized"))
                // Αν ο user είναι logged in αλλά δεν έχει δικαίωμα → 403 Forbidden
                .accessDeniedHandler((req, res, e) ->
                        res.sendError(HttpStatus.FORBIDDEN.value(), "Forbidden"))
            )
            // Δημιουργεί session μόνο όταν χρειάζεται (π.χ. μετά το login).
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            );

        return http.build();
    }

    // Ορίζει ποιοι κανόνες CORS ισχύουν. Χρειάζεται εδώ (και όχι μόνο στους controllers)
    // γιατί το Spring Security τρέχει πριν φτάσουν τα requests στους controllers.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // απαραίτητο για να λειτουργούν τα SESSION cookies
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
