package com.kumar.inventory.service;

import com.kumar.inventory.dto.response.*;
import com.kumar.inventory.entity.UploadHistory;
import com.kumar.inventory.entity.User;
import com.kumar.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Aggregates statistics for the admin dashboard.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final UploadHistoryRepository uploadHistoryRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long totalRecords     = inventoryRepository.count();
        long totalAdmins      = userRepository.countByRole(User.Role.ADMIN);
        long totalEmployees   = userRepository.countByRole(User.Role.EMPLOYEE);
        long totalUploads     = uploadHistoryRepository.count();
        long totalLogins      = loginHistoryRepository.count();

        UploadHistory lastUpload = uploadHistoryRepository
                .findTopByStatusOrderByUploadedAtDesc("SUCCESS")
                .orElse(null);

        return DashboardStatsDto.builder()
                .totalRecords(totalRecords)
                .totalAdmins(totalAdmins)
                .totalEmployees(totalEmployees)
                .lastUploadTime(lastUpload != null ? lastUpload.getUploadedAt() : null)
                .lastUploadedBy(lastUpload != null ? lastUpload.getUploadedBy() : null)
                .lastUploadFileName(lastUpload != null ? lastUpload.getFileName() : null)
                .lastUploadRecordCount(lastUpload != null ? lastUpload.getRecordsImported() : 0)
                .totalUploads(totalUploads)
                .totalLogins(totalLogins)
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<UploadHistoryDto> getUploadHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UploadHistory> result = uploadHistoryRepository.findAllByOrderByUploadedAtDesc(pageable);

        List<UploadHistoryDto> content = result.getContent().stream()
                .map(h -> UploadHistoryDto.builder()
                        .id(h.getId())
                        .fileName(h.getFileName())
                        .sheetName(h.getSheetName())
                        .recordsImported(h.getRecordsImported())
                        .uploadedBy(h.getUploadedBy())
                        .status(h.getStatus())
                        .errorMessage(h.getErrorMessage())
                        .uploadedAt(h.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        return PagedResponse.<UploadHistoryDto>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public PagedResponse<LoginHistoryDto> getLoginHistory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        var result = loginHistoryRepository.findAllByOrderByLoginAtDesc(pageable);

        List<LoginHistoryDto> content = result.getContent().stream()
                .map(h -> LoginHistoryDto.builder()
                        .id(h.getId())
                        .username(h.getUsername())
                        .role(h.getRole())
                        .status(h.getStatus())
                        .ipAddress(h.getIpAddress())
                        .failureReason(h.getFailureReason())
                        .loginAt(h.getLoginAt())
                        .build())
                .collect(Collectors.toList());

        return PagedResponse.<LoginHistoryDto>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .build();
    }
}
