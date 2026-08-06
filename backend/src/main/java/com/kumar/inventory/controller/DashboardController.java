package com.kumar.inventory.controller;

import com.kumar.inventory.dto.response.*;
import com.kumar.inventory.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin dashboard endpoints.
 * Restricted to ADMIN role only.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Dashboard", description = "Admin dashboard statistics and history — Admin only")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get Dashboard Stats",
               description = "Returns total records, user counts, last upload info, and totals")
    public ResponseEntity<DashboardStatsDto> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/upload-history")
    @Operation(summary = "Get Upload History", description = "Paginated list of all Excel uploads, newest first")
    public ResponseEntity<PagedResponse<UploadHistoryDto>> getUploadHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dashboardService.getUploadHistory(page, size));
    }

    @GetMapping("/login-history")
    @Operation(summary = "Get Login History", description = "Paginated audit log of all login attempts, newest first")
    public ResponseEntity<PagedResponse<LoginHistoryDto>> getLoginHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(dashboardService.getLoginHistory(page, size));
    }
}
