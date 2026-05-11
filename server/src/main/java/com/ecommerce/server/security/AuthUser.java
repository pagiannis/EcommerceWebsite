package com.ecommerce.server.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * Custom UserDetails που εκθέτει το user.id στο SecurityContext, ώστε να
 * μπορούν τα @PreAuthorize SpEL expressions να συγκρίνουν με URL params
 * τύπου Long (π.χ. "#userId == authentication.principal.id").
 *
 * Επεκτείνει τον default Spring User για να κρατήσουμε δωρεάν όλη τη
 * λογική γύρω από enabled/locked/expired flags.
 */
public class AuthUser extends User {

    private final Long id;

    public AuthUser(Long id, String email, String passwordHash,
                    Collection<? extends GrantedAuthority> authorities) {
        super(email, passwordHash, authorities);
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}
