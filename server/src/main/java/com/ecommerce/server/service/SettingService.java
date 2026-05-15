package com.ecommerce.server.service;

import com.ecommerce.server.models.AppSetting;
import com.ecommerce.server.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Cached access σε runtime settings. Διαβάζονται σε κάθε checkout, οπότε
 * κρατάμε ένα in-memory cache για να μην χτυπάει η βάση συνεχώς.
 *
 * Το cache invalidate-άρεται όταν ο admin καλέσει update — το next read
 * πάει στη βάση και ξανα-cache-άρει.
 */
@Service
@RequiredArgsConstructor
public class SettingService {

    // Setting keys — references από όλο το app
    public static final String TAX_RATE_KEY = "order.tax.rate";
    public static final String SHIPPING_FEE_KEY = "order.shipping.fee";

    private final AppSettingRepository repository;

    // Thread-safe cache. Αν setting δεν υπάρχει στη βάση, το service γυρίζει
    // το fallback που δίνει ο caller — δεν cache-άρουμε null/missing values.
    private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    /**
     * Διαβάζει setting ως BigDecimal. Αν δεν υπάρχει ή δεν parse-άρεται,
     * επιστρέφει το fallback — έτσι το checkout δεν σπάει ποτέ ακόμη κι αν
     * ο admin κατά λάθος διαγράψει ένα setting.
     */
    @Transactional(readOnly = true)
    public BigDecimal getDecimal(String key, BigDecimal fallback) {
        String value = cache.computeIfAbsent(key, k ->
                repository.findById(k).map(AppSetting::getValue).orElse(null));
        if (value == null) return fallback;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    /**
     * Admin update. Δημιουργεί setting αν δεν υπάρχει, αλλιώς το ενημερώνει.
     * Invalidate-άρει το cache key ώστε το next read να δει τη νέα τιμή.
     */
    @Transactional
    public AppSetting upsert(String key, String value, String description) {
        AppSetting setting = repository.findById(key).orElseGet(() ->
                AppSetting.builder().key(key).description(description).build());
        setting.setValue(value);
        if (description != null) setting.setDescription(description);
        setting.setUpdatedAt(LocalDateTime.now());
        AppSetting saved = repository.save(setting);
        cache.put(key, value);
        return saved;
    }
}
