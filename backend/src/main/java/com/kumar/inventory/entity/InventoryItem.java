package com.kumar.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Maps one row from the Excel sheet "19-05-26".
 *
 * Excel structure (header at row 3, data starts at row 4):
 *   Col 1  : Model
 *   Col 2  : DMSCode
 *   Col 3  : Model Description   ← primary search field (FULLTEXT indexed)
 *   Col 4  : Basic Price
 *   Col 5  : SGST @ 9%
 *   Col 6  : CGST @ 9%
 *   Col 7  : Ex-Showroom Price
 *   Col 8  : RTO Charges
 *   Col 9  : Smart Card Rc
 *   Col 10 : Post Sales Handling Charges
 *   Col 11 : Insurance - Vehicle (1+5)
 *   Col 12 : Accessories
 *   Col 13 : On Road Price
 *   Col 14 : Basic Insurance
 *   Col 15 : Difference
 *   Col 16 : VMC
 *   Col 17 : date
 *   Col 19 : SHORT CODE
 *   Col 20 : MODEL NAME
 *
 * NOTE: Col 18 is blank in the Excel header; it is intentionally skipped.
 */
@Entity
@Table(name = "inventory_items",
        indexes = {
                @Index(name = "idx_model_description", columnList = "model_description"),
                @Index(name = "idx_model", columnList = "model"),
                @Index(name = "idx_dms_code", columnList = "dms_code")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Excel Col 1 — Model (e.g. "Deluxe", "HF 100") */
    @Column(name = "model", length = 100)
    private String model;

    /** Excel Col 2 — DMS Code (e.g. "HDLXMDRKCFI") */
    @Column(name = "dms_code", length = 50)
    private String dmsCode;

    /**
     * Excel Col 3 — Model Description (primary search field).
     * Stored with a regular B-Tree index for LIKE '%keyword%' queries.
     */
    @Column(name = "model_description", length = 300)
    private String modelDescription;

    /** Excel Col 4 — Basic Price */
    @Column(name = "basic_price", precision = 12, scale = 2)
    private BigDecimal basicPrice;

    /** Excel Col 5 — SGST @ 9% */
    @Column(name = "sgst", precision = 12, scale = 2)
    private BigDecimal sgst;

    /** Excel Col 6 — CGST @ 9% */
    @Column(name = "cgst", precision = 12, scale = 2)
    private BigDecimal cgst;

    /** Excel Col 7 — Ex-Showroom Price */
    @Column(name = "ex_showroom_price", precision = 12, scale = 2)
    private BigDecimal exShowroomPrice;

    /** Excel Col 8 — RTO Charges */
    @Column(name = "rto_charges", precision = 12, scale = 2)
    private BigDecimal rtoCharges;

    /** Excel Col 9 — Smart Card Rc */
    @Column(name = "smart_card_rc", precision = 12, scale = 2)
    private BigDecimal smartCardRc;

    /** Excel Col 10 — Post Sales Handling Charges */
    @Column(name = "post_sales_handling_charges", precision = 12, scale = 2)
    private BigDecimal postSalesHandlingCharges;

    /** Excel Col 11 — Insurance - Vehicle (1+5) */
    @Column(name = "insurance_vehicle", precision = 12, scale = 2)
    private BigDecimal insuranceVehicle;

    /** Excel Col 12 — Accessories */
    @Column(name = "accessories", precision = 12, scale = 2)
    private BigDecimal accessories;

    /** Excel Col 13 — On Road Price */
    @Column(name = "on_road_price", precision = 12, scale = 2)
    private BigDecimal onRoadPrice;

    /** Excel Col 14 — Basic Insurance */
    @Column(name = "basic_insurance", precision = 12, scale = 2)
    private BigDecimal basicInsurance;

    /** Excel Col 15 — Difference */
    @Column(name = "difference", precision = 12, scale = 2)
    private BigDecimal difference;

    /** Excel Col 16 — VMC */
    @Column(name = "vmc", precision = 12, scale = 2)
    private BigDecimal vmc;

    /** Excel Col 17 — Date */
    @Column(name = "date")
    private LocalDate date;

    /** Excel Col 19 — SHORT CODE */
    @Column(name = "short_code", length = 50)
    private String shortCode;

    /** Excel Col 20 — MODEL NAME */
    @Column(name = "model_name", length = 200)
    private String modelName;
}
