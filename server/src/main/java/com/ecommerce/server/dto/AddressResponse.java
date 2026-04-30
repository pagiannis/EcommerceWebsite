package com.ecommerce.server.dto;

public record AddressResponse(
        Long id,
        String street,
        String city,
        String postalCode,
        String country,
        Boolean isDefault
) {}
