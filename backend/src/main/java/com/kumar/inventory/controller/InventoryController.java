package com.kumar.inventory.controller;

import com.kumar.inventory.dto.response.InventoryItemDto;
import com.kumar.inventory.dto.response.PagedResponse;
import com.kumar.inventory.service.ExcelExportService;
import com.kumar.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * REST endpoints for inventory search and export.
 * Accessible by both ADMIN and EMPLOYEE roles.
 */
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Search and export inventory records")
public class InventoryController {

    private final InventoryService inventoryService;
    private final ExcelExportService excelExportService;

    /**
     * GET /api/inventory/search?keyword=Deluxe&page=0&size=25&sortBy=modelDescription&sortDir=asc
     */
    @GetMapping("/search")
    @Operation(summary = "Search Inventory",
               description = "Paginated, case-insensitive, partial-match search across Model Description, Model, and Model Name")
    public ResponseEntity<PagedResponse<InventoryItemDto>> search(
            @Parameter(description = "Search keyword (partial match)") @RequestParam(required = false, defaultValue = "") String keyword,
            @Parameter(description = "Zero-based page number")         @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size (max 100)")            @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Sort field")                     @RequestParam(defaultValue = "modelDescription") String sortBy,
            @Parameter(description = "Sort direction: asc or desc")    @RequestParam(defaultValue = "asc") String sortDir,
            @Parameter(description = "Return unique models only")      @RequestParam(defaultValue = "false") boolean uniqueModels) {

        return ResponseEntity.ok(inventoryService.search(keyword, page, size, sortBy, sortDir, uniqueModels));
    }

    /**
     * GET /api/inventory/export?keyword=Deluxe
     * Returns an .xlsx file with all matching records.
     */
    @GetMapping("/export")
    @Operation(summary = "Export to Excel",
               description = "Download all matching search results as an Excel (.xlsx) file")
    public ResponseEntity<byte[]> exportToExcel(
            @RequestParam(required = false, defaultValue = "") String keyword) throws IOException {

        List<InventoryItemDto> items = inventoryService.searchAll(keyword);
        byte[] excelBytes = excelExportService.exportToExcel(items, keyword);

        String filename = "inventory_export_" + System.currentTimeMillis() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
