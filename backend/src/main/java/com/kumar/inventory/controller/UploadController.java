package com.kumar.inventory.controller;

import com.kumar.inventory.dto.response.UploadHistoryDto;
import com.kumar.inventory.entity.UploadHistory;
import com.kumar.inventory.service.ExcelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST endpoint for uploading Excel files.
 * Restricted to ADMIN role only.
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Upload", description = "Excel file upload — Admin only")
@SecurityRequirement(name = "bearerAuth")
public class UploadController {

    private final ExcelService excelService;

    /**
     * POST /api/upload/excel
     * Multipart form: file (required), sheetName (optional, defaults to "19-05-26")
     */
    @PostMapping("/excel")
    @Operation(summary = "Upload Excel",
               description = "Upload an Excel workbook. All old inventory data is backed up, then replaced with the new file's data.")
    public ResponseEntity<Map<String, Object>> uploadExcel(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "19-05-26") String sheetName,
            Authentication authentication) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only .xlsx files are supported"));
        }

        String uploadedBy = authentication.getName();
        UploadHistory result = excelService.importExcel(file, sheetName, uploadedBy);

        return ResponseEntity.ok(Map.of(
                "message", "Upload successful",
                "recordsImported", result.getRecordsImported(),
                "fileName", result.getFileName(),
                "sheetName", result.getSheetName(),
                "uploadedAt", result.getUploadedAt().toString(),
                "uploadId", result.getId()
        ));
    }
}
