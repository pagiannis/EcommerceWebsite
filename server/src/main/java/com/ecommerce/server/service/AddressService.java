package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.AddressRequest;
import com.ecommerce.server.dto.response.AddressResponse;
import com.ecommerce.server.models.Address;
import com.ecommerce.server.models.User;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.repository.AddressRepository;
import com.ecommerce.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = requireAddressOwner(userId, addressId);

        if (Boolean.TRUE.equals(request.isDefault()))
            clearDefault(userId);

        address.setStreet(request.street());
        address.setCity(request.city());
        address.setPostalCode(request.postalCode());
        address.setCountry(request.country());
        address.setDefault(Boolean.TRUE.equals(request.isDefault()));

        return toResponse(addressRepository.save(address));
    }

    public void deleteAddress(Long userId, Long addressId) {
        requireAddressOwner(userId, addressId);
        addressRepository.deleteById(addressId);
    }

    @Transactional
    public AddressResponse setDefault(Long userId, Long addressId) {
        Address address = requireAddressOwner(userId, addressId);
        clearDefault(userId);
        address.setDefault(true);
        return toResponse(addressRepository.save(address));
    }

    // Επιβεβαιώνει ότι η διεύθυνση ανήκει στον συγκεκριμένο user — αλλιώς 403.
    private Address requireAddressOwner(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }
        return address;
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
