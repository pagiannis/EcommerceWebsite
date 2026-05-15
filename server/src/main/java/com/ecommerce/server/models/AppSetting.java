package com.ecommerce.server.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Key-value table για runtime-configurable settings (tax rate, shipping fee
 * και ό,τι άλλο μελλοντικά). Στο admin panel ο admin μπορεί να αλλάξει αυτές
 * τις τιμές χωρίς redeploy.
 *
 * value: αποθηκεύεται ως String για να μπορεί να κρατήσει BigDecimal/boolean/
 * τυχαία config. Το SettingService κάνει type-safe parse στο read.
 */
@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSetting {

    @Id
    @Column(name = "setting_key", length = 100)
    private String key;

    @Column(name = "setting_value", nullable = false, length = 500)
    private String value;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
