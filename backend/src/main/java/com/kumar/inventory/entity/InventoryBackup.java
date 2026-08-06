package com.kumar.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Snapshot of inventory_items taken before each new upload replaces the data.
 * Mirrors all columns of InventoryItem plus backup metadata.
 */
@Entity
@Table(name = "inventory_backup",
        indexes = @Index(name = "idx_backup_batch", columnList = "backup_batch_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBackup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Groups all rows from the same backup snapshot together */
    @Column(nullable = false)
    private String backupBatchId;

    /** Original inventory_items.id at time of backup */
    private Long originalId;

    @Column(length = 100)  private String model;
    @Column(length = 50)   private String dmsCode;
    @Column(length = 300)  private String modelDescription;
    @Column(precision = 12, scale = 2) private BigDecimal basicPrice;
    @Column(precision = 12, scale = 2) private BigDecimal sgst;
    @Column(precision = 12, scale = 2) private BigDecimal cgst;
    @Column(precision = 12, scale = 2) private BigDecimal exShowroomPrice;
    @Column(precision = 12, scale = 2) private BigDecimal rtoCharges;
    @Column(precision = 12, scale = 2) private BigDecimal smartCardRc;
    @Column(precision = 12, scale = 2) private BigDecimal postSalesHandlingCharges;
    @Column(precision = 12, scale = 2) private BigDecimal insuranceVehicle;
    @Column(precision = 12, scale = 2) private BigDecimal accessories;
    @Column(precision = 12, scale = 2) private BigDecimal onRoadPrice;
    @Column(precision = 12, scale = 2) private BigDecimal basicInsurance;
    @Column(precision = 12, scale = 2) private BigDecimal difference;
    @Column(precision = 12, scale = 2) private BigDecimal vmc;
    private LocalDate date;
    @Column(length = 50)   private String shortCode;
    @Column(length = 200)  private String modelName;

    /** When this backup was created */
    @Column(updatable = false)
    private LocalDateTime backedUpAt;
}
