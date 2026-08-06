package com.kumar.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Dashboard statistics response — shown on the admin home page.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {

    private long totalRecords;
    private long totalAdmins;
    private long totalEmployees;
    private LocalDateTime lastUploadTime;
    private String lastUploadedBy;
    private String lastUploadFileName;
    private int lastUploadRecordCount;
    private long totalUploads;
    private long totalLogins;
}
