package com.ecommerce.server.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    /**
     * Αν ο admin θες να εμφανίζει μόνο επιλεγμένες αξιολογήσεις
     * (π.χ. στο homepage testimonials section)
     */
    @Builder.Default
    private boolean featured = false;

    /**
     * Approval flow - δεν δείχνουμε reviews που δεν έχουν εγκριθεί
     */
    @Builder.Default
    private boolean approved = false;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}