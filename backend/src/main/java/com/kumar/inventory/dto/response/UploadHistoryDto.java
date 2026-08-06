package com.kumar.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents one upload history entry for the admin dashboard table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadHistoryDto {

    private Long id;
    private String fileName;
    private String sheetName;
    private int recordsImported;
    private String uploadedBy;
    private String status;
    private String errorMessage;
    private LocalDateTime uploadedAt;
}
