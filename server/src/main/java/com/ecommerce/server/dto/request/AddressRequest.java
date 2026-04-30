package com.ecommerce.server.dto.request;

public record AddressRequest(
        String street,
        String city,
        String postalCode,
        String country,
        Boolean isDefault
) {}

