package com.kumar.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents one login history entry for the admin dashboard table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistoryDto {

    private Long id;
    private String username;
    private String role;
    private String status;
    private String ipAddress;
    private String failureReason;
    private LocalDateTime loginAt;
}
