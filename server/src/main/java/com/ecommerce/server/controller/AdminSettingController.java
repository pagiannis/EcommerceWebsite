package com.ecommerce.server.controller;

import com.ecommerce.server.dto.request.SettingRequest;
import com.ecommerce.server.dto.response.SettingResponse;
import com.ecommerce.server.models.AppSetting;
import com.ecommerce.server.repository.AppSettingRepository;
import com.ecommerce.server.service.SettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Admin endpoints για τα runtime settings (tax rate, shipping fee κλπ.).
 * Ο admin κάνει PUT για να αλλάξει τιμή — το SettingService invalidate-άρει
 * το cache και η επόμενη παραγγελία βλέπει τη νέα τιμή.
 */
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingController {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SettingService settingService;
    private final AppSettingRepository repository;

    @GetMapping
    public ResponseEntity<List<SettingResponse>> getAllSettings() {
        // Bounded (λίγα keys, growth-rate σχεδόν μηδενικός) — δεν χρειάζεται pagination.
        List<SettingResponse> all = repository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(all);
    }

    @PutMapping("/{key}")
    public ResponseEntity<SettingResponse> updateSetting(@PathVariable String key,
                                                         @Valid @RequestBody SettingRequest request) {
        AppSetting updated = settingService.upsert(key, request.value(), request.description());
        return ResponseEntity.ok(toResponse(updated));
    }

    private SettingResponse toResponse(AppSetting s) {
        return new SettingResponse(
                s.getKey(),
                s.getValue(),
                s.getDescription(),
                s.getUpdatedAt().format(DATE_FORMATTER)
        );
    }
}
