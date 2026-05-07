package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.AddressRequest;
import com.ecommerce.server.dto.response.AddressResponse;
import com.ecommerce.server.models.Address;
import com.ecommerce.server.models.User;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.AddressRepository;
import com.ecommerce.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(request.isDefault()))
            clearDefault(userId);

        Address address = Address.builder()
                .user(user)
                .street(request.street())
                .city(request.city())
                .postalCode(request.postalCode())
                .country(request.country())
                .isDefault(Boolean.TRUE.equals(request.isDefault()))
                .build();

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (Boolean.TRUE.equals(request.isDefault()))
            clearDefault(address.getUser().getId());

        address.setStreet(request.street());
        address.setCity(request.city());
        address.setPostalCode(request.postalCode());
        address.setCountry(request.country());
        address.setDefault(Boolean.TRUE.equals(request.isDefault()));

        return toResponse(addressRepository.save(address));
    }

    public void deleteAddress(Long addressId) {
        if (!addressRepository.existsById(addressId))
            throw new ResourceNotFoundException("Address not found");
        addressRepository.deleteById(addressId);
    }

    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        clearDefault(userId);
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        address.setDefault(true);
        return toResponse(addressRepository.save(address));
    }

    // Αφαιρεί το default flag από όλες τις διευθύνσεις του χρήστη
    private void clearDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private AddressResponse toResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getStreet(),
                address.getCity(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefault()
        );
    }
}
