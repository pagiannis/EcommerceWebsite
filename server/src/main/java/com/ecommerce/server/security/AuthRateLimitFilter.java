package com.ecommerce.server.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.function.Supplier;

/**
 * Per-IP rate limiting για τα authentication endpoints, ώστε να αποτρέπεται
 * brute force και credential stuffing στο /login και spam στο /register.
 *
 * Όρια:
 *   - /api/users/login    : 10 αιτήματα/λεπτό ανά IP
 *   - /api/users/register : 50 αιτήματα/ώρα   ανά IP
 *
 * Όταν ξεπεραστεί το όριο επιστρέφει 429 Too Many Requests.
 *
 * Τα buckets αποθηκεύονται σε Caffeine cache με expireAfterAccess ώστε
 * παλιές καταχωρήσεις IP να καθαρίζονται αυτόματα και να μη γεμίζει η μνήμη.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/users/login";
    private static final String REGISTER_PATH = "/api/users/register";

    private final Cache<String, Bucket> loginBuckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(15))
            .maximumSize(100_000)
            .build();

    private final Cache<String, Bucket> registerBuckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofHours(2))
            .maximumSize(100_000)
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            String path = request.getRequestURI();
            String ip = request.getRemoteAddr();

            if (LOGIN_PATH.equals(path)) {
                if (!tryConsume(loginBuckets, ip, this::newLoginBucket)) {
                    reject(response, "Too many login attempts. Please try again later.");
                    return;
                }
            } else if (REGISTER_PATH.equals(path)) {
                if (!tryConsume(registerBuckets, ip, this::newRegisterBucket)) {
                    reject(response, "Too many registration attempts. Please try again later.");
                    return;
                }
            }
        }
        chain.doFilter(request, response);
    }

    private boolean tryConsume(Cache<String, Bucket> buckets, String ip, Supplier<Bucket> factory) {
        return buckets.get(ip, k -> factory.get()).tryConsume(1);
    }

    private Bucket newLoginBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket newRegisterBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(50)
                .refillIntervally(50, Duration.ofHours(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write(String.format(
                "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"%s\",\"timestamp\":\"%s\"}",
                message, LocalDateTime.now()
        ));
    }
}
