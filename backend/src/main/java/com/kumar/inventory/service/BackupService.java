package com.kumar.inventory.service;

import com.kumar.inventory.entity.InventoryBackup;
import com.kumar.inventory.entity.InventoryItem;
import com.kumar.inventory.repository.InventoryBackupRepository;
import com.kumar.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Creates a snapshot of all current inventory records in the inventory_backup
 * table before each Excel replace operation.
 *
 * Each backup run is identified by a unique backupBatchId so individual
 * backup sets can be queried independently.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    private final InventoryRepository inventoryRepository;
    private final InventoryBackupRepository inventoryBackupRepository;

    private static final DateTimeFormatter BATCH_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Copies all rows from inventory_items → inventory_backup.
     *
     * @return the generated backupBatchId (useful for logging/reference)
     */
    @Transactional
    public String backupCurrentData() {
        List<InventoryItem> currentItems = inventoryRepository.findAll();

        if (currentItems.isEmpty()) {
            log.info("No existing inventory data to backup — skipping backup.");
            return null;
        }

        String batchId = "BACKUP_" + LocalDateTime.now().format(BATCH_FORMATTER) + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        LocalDateTime now = LocalDateTime.now();

        List<InventoryBackup> backups = currentItems.stream()
                .map(item -> InventoryBackup.builder()
                        .backupBatchId(batchId)
                        .originalId(item.getId())
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
                        .backedUpAt(now)
                        .build())
                .collect(Collectors.toList());

        inventoryBackupRepository.saveAll(backups);
        log.info("Backup complete: {} records saved with batchId '{}'", backups.size(), batchId);
        return batchId;
    }
}
