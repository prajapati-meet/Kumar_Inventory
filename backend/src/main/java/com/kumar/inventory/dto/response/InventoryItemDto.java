package com.kumar.inventory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data transfer object for a single inventory record.
 * Mirrors all 18 columns from the Excel sheet.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDto {

    private Long id;
    private String model;
    private String dmsCode;
    private String modelDescription;
    private BigDecimal basicPrice;
    private BigDecimal sgst;
    private BigDecimal cgst;
    private BigDecimal exShowroomPrice;
    private BigDecimal rtoCharges;
    private BigDecimal smartCardRc;
    private BigDecimal postSalesHandlingCharges;
    private BigDecimal insuranceVehicle;
    private BigDecimal accessories;
    private BigDecimal onRoadPrice;
    private BigDecimal basicInsurance;
    private BigDecimal difference;
    private BigDecimal vmc;
    private LocalDate date;
    private String shortCode;
    private String modelName;
}
