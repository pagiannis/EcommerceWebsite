package com.ecommerce.server.service;

import com.ecommerce.server.dto.request.AddressRequest;
import com.ecommerce.server.dto.response.AddressResponse;
import com.ecommerce.server.exception.ResourceNotFoundException;
import com.ecommerce.server.models.Address;
import com.ecommerce.server.models.User;
import com.ecommerce.server.models.enums.Role;
import com.ecommerce.server.repository.AddressRepository;
import com.ecommerce.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests για το AddressService.
 *
 * Κάλυψη: CRUD διευθύνσεων, ownership checks, λογική του isDefault flag
 * (μόνο μία default ανά χρήστη — clearDefault πριν από κάθε set).
 */
@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    private static final Long USER_ID = 1L;
    private static final Long OTHER_USER_ID = 2L;
    private static final Long ADDRESS_ID = 10L;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    private User testUser;
    private Address existingAddress;
    private AddressRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .email("user@test.com")
                .role(Role.USER)
                .build();

        existingAddress = Address.builder()
                .id(ADDRESS_ID)
                .user(testUser)
                .street("Ερμού 15")
                .city("Αθήνα")
                .postalCode("10563")
                .country("Greece")
                .isDefault(false)
                .build();

        validRequest = new AddressRequest(
                "Νέα Οδός 5",
                "Θεσσαλονίκη",
                "54622",
                "Greece",
                false
        );
    }

    // ---------- getUserAddresses ----------

    @Test
    @DisplayName("getUserAddresses: επιστρέφει λίστα διευθύνσεων ως responses")
    void getUserAddresses_returnsMappedList() {
        when(addressRepository.findByUserId(USER_ID))
                .thenReturn(List.of(existingAddress));

        List<AddressResponse> result = addressService.getUserAddresses(USER_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(ADDRESS_ID);
        assertThat(result.get(0).street()).isEqualTo("Ερμού 15");
        assertThat(result.get(0).city()).isEqualTo("Αθήνα");
    }

    // ---------- addAddress ----------

    @Test
    @DisplayName("addAddress: αν δεν βρεθεί ο user, πετάει ResourceNotFoundException")
    void addAddress_userNotFound_throws() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.addAddress(USER_ID, validRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(addressRepository, never()).save(any());
    }

    @Test
    @DisplayName("addAddress: με isDefault=false αποθηκεύει χωρίς να αλλάξει τυχόν υπάρχουσα default")
    void addAddress_nonDefault_savesWithoutClearingExisting() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> {
            Address a = inv.getArgument(0);
            a.setId(99L);
            return a;
        });

        AddressResponse response = addressService.addAddress(USER_ID, validRequest);

        assertThat(response.isDefault()).isFalse();
        // Δεν πρέπει να αναζητηθεί η υπάρχουσα default αφού δεν θέλει να αλλάξει default
        verify(addressRepository, never()).findByUserIdAndIsDefaultTrue(anyLong());
    }

    @Test
    @DisplayName("addAddress: με isDefault=true και ΧΩΡΙΣ υπάρχουσα default, αποθηκεύει ως default")
    void addAddress_defaultTrue_noExistingDefault_savesAsDefault() {
        AddressRequest defaultReq = new AddressRequest(
                "Πανεπιστημίου 1", "Αθήνα", "10564", "Greece", true);

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(addressRepository.findByUserIdAndIsDefaultTrue(USER_ID))
                .thenReturn(Optional.empty());
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> {
            Address a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });

        AddressResponse response = addressService.addAddress(USER_ID, defaultReq);

        assertThat(response.isDefault()).isTrue();
    }

    @Test
    @DisplayName("addAddress: με isDefault=true και ΥΠΑΡΧΟΥΣΑ default, καθαρίζει την παλιά")
    void addAddress_defaultTrue_withExistingDefault_clearsOld() {
        Address oldDefault = Address.builder()
                .id(50L)
                .user(testUser)
                .street("Old")
                .city("Old")
                .postalCode("00000")
                .country("Greece")
                .isDefault(true)
                .build();

        AddressRequest defaultReq = new AddressRequest(
                "Νέα 1", "Αθήνα", "10000", "Greece", true);

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(addressRepository.findByUserIdAndIsDefaultTrue(USER_ID))
                .thenReturn(Optional.of(oldDefault));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        addressService.addAddress(USER_ID, defaultReq);

        // Επιβεβαιώνουμε ότι η παλιά default έγινε false και ότι αποθηκεύτηκε
        assertThat(oldDefault.isDefault()).isFalse();
        // save καλείται 2 φορές: 1) για να καθαρίσει την παλιά, 2) για τη νέα
        verify(addressRepository, times(2)).save(any(Address.class));
    }

    // ---------- updateAddress ----------

    @Test
    @DisplayName("updateAddress: αν δεν βρεθεί η διεύθυνση, ResourceNotFoundException")
    void updateAddress_addressNotFound_throws() {
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.updateAddress(USER_ID, ADDRESS_ID, validRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Address not found");
    }

    @Test
    @DisplayName("updateAddress: αν η διεύθυνση ανήκει σε άλλο user, AccessDeniedException")
    void updateAddress_notOwner_throwsAccessDenied() {
        User otherUser = User.builder().id(OTHER_USER_ID).build();
        existingAddress.setUser(otherUser);
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));

        assertThatThrownBy(() -> addressService.updateAddress(USER_ID, ADDRESS_ID, validRequest))
                .isInstanceOf(AccessDeniedException.class);

        verify(addressRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateAddress: ενημερώνει όλα τα πεδία")
    void updateAddress_updatesAllFields() {
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        addressService.updateAddress(USER_ID, ADDRESS_ID, validRequest);

        ArgumentCaptor<Address> captor = ArgumentCaptor.forClass(Address.class);
        verify(addressRepository).save(captor.capture());
        Address saved = captor.getValue();

        assertThat(saved.getStreet()).isEqualTo("Νέα Οδός 5");
        assertThat(saved.getCity()).isEqualTo("Θεσσαλονίκη");
        assertThat(saved.getPostalCode()).isEqualTo("54622");
        assertThat(saved.getCountry()).isEqualTo("Greece");
    }

    // ---------- deleteAddress ----------

    @Test
    @DisplayName("deleteAddress: όταν είναι ο owner, διαγράφει")
    void deleteAddress_owner_deletes() {
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));

        addressService.deleteAddress(USER_ID, ADDRESS_ID);

        verify(addressRepository).deleteById(ADDRESS_ID);
    }

    @Test
    @DisplayName("deleteAddress: αν δεν είναι ο owner, AccessDeniedException και δεν διαγράφει")
    void deleteAddress_notOwner_throws() {
        User otherUser = User.builder().id(OTHER_USER_ID).build();
        existingAddress.setUser(otherUser);
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));

        assertThatThrownBy(() -> addressService.deleteAddress(USER_ID, ADDRESS_ID))
                .isInstanceOf(AccessDeniedException.class);

        verify(addressRepository, never()).deleteById(anyLong());
    }

    // ---------- setDefault ----------

    @Test
    @DisplayName("setDefault: σηκώνει το flag στη νέα και το καθαρίζει από την παλιά default")
    void setDefault_clearsPreviousAndSetsNew() {
        Address oldDefault = Address.builder()
                .id(50L)
                .user(testUser)
                .street("Old")
                .city("Old")
                .postalCode("00000")
                .country("Greece")
                .isDefault(true)
                .build();

        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));
        when(addressRepository.findByUserIdAndIsDefaultTrue(USER_ID))
                .thenReturn(Optional.of(oldDefault));
        when(addressRepository.save(any(Address.class))).thenAnswer(inv -> inv.getArgument(0));

        AddressResponse response = addressService.setDefault(USER_ID, ADDRESS_ID);

        assertThat(response.isDefault()).isTrue();
        assertThat(oldDefault.isDefault()).isFalse();
    }

    @Test
    @DisplayName("setDefault: αν η διεύθυνση δεν ανήκει στον user, AccessDeniedException")
    void setDefault_notOwner_throws() {
        User otherUser = User.builder().id(OTHER_USER_ID).build();
        existingAddress.setUser(otherUser);
        when(addressRepository.findById(ADDRESS_ID)).thenReturn(Optional.of(existingAddress));

        assertThatThrownBy(() -> addressService.setDefault(USER_ID, ADDRESS_ID))
                .isInstanceOf(AccessDeniedException.class);
    }
}
