package com.kumar.inventory.service;

import com.kumar.inventory.dto.response.InventoryItemDto;
import com.kumar.inventory.dto.response.PagedResponse;
import com.kumar.inventory.entity.InventoryItem;
import com.kumar.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Provides paginated search and export functionality for inventory records.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    /**
     * Paginated, case-insensitive partial-match search.
     *
     * @param keyword    search term (can be null or empty to return all)
     * @param page       zero-based page number
     * @param size       page size (max 100 enforced)
     * @param sortBy     field to sort by (default: id)
     * @param sortDir    "asc" or "desc"
     */
    @Transactional(readOnly = true)
    public PagedResponse<InventoryItemDto> search(String keyword, int page, int size,
                                                   String sortBy, String sortDir, boolean uniqueModels) {
        // Sanitize inputs
        size = Math.min(size, 100);
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        String normalizedKeyword = keyword == null ? "" : keyword.toLowerCase().replaceAll("[\\s\\-_]", "");
        Page<InventoryItem> resultPage = uniqueModels 
                ? inventoryRepository.searchUniqueModels(keyword, normalizedKeyword, pageable)
                : inventoryRepository.search(keyword, normalizedKeyword, pageable);

        List<InventoryItemDto> content = resultPage.getContent()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        log.debug("Search '{}' (normalized: '{}') returned {}/{} records (page {}/{})",
                keyword, normalizedKeyword, content.size(), resultPage.getTotalElements(), page, resultPage.getTotalPages());

        return PagedResponse.<InventoryItemDto>builder()
                .content(content)
                .page(resultPage.getNumber())
                .size(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .last(resultPage.isLast())
                .keyword(keyword)
                .build();
    }

    /**
     * Returns ALL matching records for Excel export (no pagination limit).
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDto> searchAll(String keyword) {
        String normalizedKeyword = keyword == null ? "" : keyword.toLowerCase().replaceAll("[\\s\\-_]", "");
        return inventoryRepository.searchAll(keyword, normalizedKeyword)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Entity → DTO Mapping ─────────────────────────────────────────────────

    private InventoryItemDto toDto(InventoryItem item) {
        return InventoryItemDto.builder()
                .id(item.getId())
                .model(item.getModel())
                .dmsCode(item.getDmsCode())
                .modelDescription(item.getModelDescription())
                .basicPrice(item.getBasicPrice())
                .sgst(item.getSgst())
                .cgst(item.getCgst())
                .exShowroomPrice(item.getExShowroomPrice())
                .rtoCharges(item.getRtoCharges())
                .smartCardRc(item.getSmartCardRc())
                .postSalesHandlingCharges(item.getPostSalesHandlingCharges())
                .insuranceVehicle(item.getInsuranceVehicle())
                .accessories(item.getAccessories())
                .onRoadPrice(item.getOnRoadPrice())
                .basicInsurance(item.getBasicInsurance())
                .difference(item.getDifference())
                .vmc(item.getVmc())
                .date(item.getDate())
                .shortCode(item.getShortCode())
                .modelName(item.getModelName())
                .build();
    }
}
