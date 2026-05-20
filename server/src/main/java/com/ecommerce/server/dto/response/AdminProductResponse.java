package com.ecommerce.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lightweight response για admin product list. Έχει τα ίδια essentials με
 * το ProductResponse (name, price, brand, category) αλλά αντί για images
 * και variants list, εκθέτει μόνο το variantCount — αρκετό για να ξέρει
 * ο admin αν το product είναι ορατό στους πελάτες ή όχι.
 *
 * variantCount == 0 → product υπάρχει στη βάση αλλά ΔΕΝ εμφανίζεται στο
 * shop (το public query κάνει INNER JOIN variants).
 */
public record AdminProductResponse(
        Long id,
        String name,
        String brand,
        String category,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer discountPercent,
        Double rating,
        Integer reviewCount,
        Long variantCount,
        LocalDateTime createdAt
) {}
