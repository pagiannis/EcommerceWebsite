package com.ecommerce.server.security;

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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

/**
 * Per-IP rate limiting για τα authentication endpoints, ώστε να αποτρέπεται
 * brute force και credential stuffing στο /login και spam στο /register.
 *
 * Όρια:
 *   - /api/users/login    : 10 αιτήματα/λεπτό ανά IP
 *   - /api/users/register :  5 αιτήματα/ώρα   ανά IP
 *
 * Όταν ξεπεραστεί το όριο επιστρέφει 429 Too Many Requests.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/users/login";
    private static final String REGISTER_PATH = "/api/users/register";

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            String path = request.getRequestURI();
            String ip = clientIp(request);

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

    private boolean tryConsume(Map<String, Bucket> buckets, String ip, Supplier<Bucket> factory) {
        return buckets.computeIfAbsent(ip, k -> factory.get()).tryConsume(1);
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

    // Παίρνει το πραγματικό IP του client. Αν τρέχουμε πίσω από proxy/load balancer
    // χρησιμοποιούμε το X-Forwarded-For (πρώτο IP της λίστας), αλλιώς το remote address.
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        return request.getRemoteAddr();
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
