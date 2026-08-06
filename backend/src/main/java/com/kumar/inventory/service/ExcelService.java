package com.kumar.inventory.service;

import com.kumar.inventory.entity.InventoryItem;
import com.kumar.inventory.entity.UploadHistory;
import com.kumar.inventory.exception.ExcelParseException;
import com.kumar.inventory.repository.InventoryRepository;
import com.kumar.inventory.repository.UploadHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Reads the uploaded Excel workbook using Apache POI and imports records
 * into the inventory_items table.
 *
 * Excel sheet structure (sheet "19-05-26" and future uploads):
 *   Row 1 : Title row         — SKIPPED
 *   Row 2 : Column numbers    — SKIPPED
 *   Row 3 : Column headers    — used to validate structure
 *   Row 4+ : Data rows        — imported
 *
 * Column mapping (0-indexed):
 *   0  = Model
 *   1  = DMSCode
 *   2  = Model Description
 *   3  = Basic Price
 *   4  = SGST @ 9%
 *   5  = CGST @ 9%
 *   6  = Ex-Showroom Price
 *   7  = RTO Charges
 *   8  = Smart Card Rc
 *   9  = Post Sales Handling Charges
 *   10 = Insurance - Vehicle (1+5)
 *   11 = Accessories
 *   12 = On Road Price
 *   13 = Basic Insurance
 *   14 = Difference
 *   15 = VMC
 *   16 = date
 *   17 = (blank in header — skipped)
 *   18 = SHORT CODE
 *   19 = MODEL NAME
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelService {

    private final InventoryRepository inventoryRepository;
    private final UploadHistoryRepository uploadHistoryRepository;
    private final BackupService backupService;

    // Row indices are 0-based internally in POI
    private static final int TITLE_ROW_INDEX   = 0; // Row 1 — title
    private static final int NUMBERS_ROW_INDEX = 1; // Row 2 — column numbers
    private static final int HEADER_ROW_INDEX  = 2; // Row 3 — actual headers
    private static final int DATA_START_INDEX  = 3; // Row 4 — first data row

    @Transactional
    public UploadHistory importExcel(MultipartFile file, String sheetName, String uploadedBy) {
        log.info("Starting Excel import: file='{}', sheet='{}', uploadedBy='{}'",
                file.getOriginalFilename(), sheetName, uploadedBy);

        String backupBatchId = null;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = workbook.getSheet(sheetName);
            if (sheet == null) {
                // Fallback: try first sheet
                sheet = workbook.getSheetAt(0);
                if (sheet == null) {
                    throw new ExcelParseException("Sheet '" + sheetName + "' not found in the workbook.");
                }
                log.warn("Sheet '{}' not found. Falling back to first sheet: '{}'", sheetName, sheet.getSheetName());
            }

            // Step 1: Backup existing data
            backupBatchId = backupService.backupCurrentData();

            // Step 2: Delete all current inventory
            inventoryRepository.deleteAllInBatch();
            log.info("Cleared existing inventory records.");

            // Step 3: Parse and collect new records
            List<InventoryItem> items = new ArrayList<>();
            int lastRowNum = sheet.getLastRowNum();

            for (int rowIdx = DATA_START_INDEX; rowIdx <= lastRowNum; rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                try {
                    InventoryItem item = mapRowToItem(row);
                    if (item != null) {
                        items.add(item);
                    }
                } catch (Exception e) {
                    log.warn("Skipping row {} due to parse error: {}", rowIdx + 1, e.getMessage());
                }
            }

            // Step 4: Batch save
            inventoryRepository.saveAll(items);
            log.info("Imported {} records from Excel.", items.size());

            // Step 5: Record success in upload_history
            UploadHistory history = UploadHistory.builder()
                    .fileName(file.getOriginalFilename())
                    .sheetName(sheetName)
                    .recordsImported(items.size())
                    .uploadedBy(uploadedBy)
                    .status("SUCCESS")
                    .notes(backupBatchId != null ? "Backup batch: " + backupBatchId : "No prior data to backup")
                    .build();
            return uploadHistoryRepository.save(history);

        } catch (ExcelParseException e) {
            saveFailedHistory(file.getOriginalFilename(), sheetName, uploadedBy, e.getMessage());
            throw e;
        } catch (IOException e) {
            String msg = "Failed to read Excel file: " + e.getMessage();
            saveFailedHistory(file.getOriginalFilename(), sheetName, uploadedBy, msg);
            throw new ExcelParseException(msg, e);
        } catch (Exception e) {
            String msg = "Unexpected error during import: " + e.getMessage();
            saveFailedHistory(file.getOriginalFilename(), sheetName, uploadedBy, msg);
            throw new ExcelParseException(msg, e);
        }
    }

    /**
     * Maps a single POI Row to an InventoryItem entity.
     * Returns null if the row has no meaningful data.
     */
    private InventoryItem mapRowToItem(Row row) {
        String model = getCellString(row, 0);
        String dmsCode = getCellString(row, 1);
        String modelDescription = getCellString(row, 2);

        // Skip rows that have no Model Description (likely empty or section-header rows)
        if (modelDescription == null || modelDescription.isBlank()) {
            return null;
        }

        return InventoryItem.builder()
                .model(model)
                .dmsCode(dmsCode)
                .modelDescription(modelDescription.trim())
                .basicPrice(getCellDecimal(row, 3))
                .sgst(getCellDecimal(row, 4))
                .cgst(getCellDecimal(row, 5))
                .exShowroomPrice(getCellDecimal(row, 6))
                .rtoCharges(getCellDecimal(row, 7))
                .smartCardRc(getCellDecimal(row, 8))
                .postSalesHandlingCharges(getCellDecimal(row, 9))
                .insuranceVehicle(getCellDecimal(row, 10))
                .accessories(getCellDecimal(row, 11))
                .onRoadPrice(getCellDecimal(row, 12))
                .basicInsurance(getCellDecimal(row, 13))
                .difference(getCellDecimal(row, 14))
                .vmc(getCellDecimal(row, 15))
                .date(getCellDate(row, 16))
                // Col 17 (index 17) is blank in the header — skipped
                .shortCode(getCellString(row, 18))
                .modelName(getCellString(row, 19))
                .build();
    }

    // ─── POI Helper Methods ──────────────────────────────────────────────────

    private String getCellString(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                // Avoid trailing ".0" for whole numbers
                yield val == Math.floor(val) ? String.valueOf((long) val) : String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield cell.getStringCellValue(); }
                catch (Exception e) { yield String.valueOf(cell.getNumericCellValue()); }
            }
            default -> null;
        };
    }

    private BigDecimal getCellDecimal(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;

        try {
            return switch (cell.getCellType()) {
                case NUMERIC -> BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING  -> {
                    String s = cell.getStringCellValue().trim().replaceAll("[^\\d.-]", "");
                    yield s.isEmpty() ? null : new BigDecimal(s);
                }
                case FORMULA -> BigDecimal.valueOf(cell.getNumericCellValue());
                default -> null;
            };
        } catch (NumberFormatException e) {
            log.debug("Could not parse decimal from cell ({},{}): {}", row.getRowNum(), colIdx, e.getMessage());
            return null;
        }
    }

    private LocalDate getCellDate(Row row, int colIdx) {
        Cell cell = row.getCell(colIdx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;

        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                Date date = cell.getDateCellValue();
                return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }
            if (cell.getCellType() == CellType.STRING) {
                // Handle "dd-MM-yyyy" format as seen in the sample data
                String dateStr = cell.getStringCellValue().trim();
                if (!dateStr.isEmpty()) {
                    // Try dd-MM-yyyy
                    String[] parts = dateStr.split("[-/]");
                    if (parts.length == 3) {
                        return LocalDate.of(
                                Integer.parseInt(parts[2]),
                                Integer.parseInt(parts[1]),
                                Integer.parseInt(parts[0]));
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Could not parse date from cell ({},{}): {}", row.getRowNum(), colIdx, e.getMessage());
        }
        return null;
    }

    private boolean isRowEmpty(Row row) {
        for (Cell cell : row) {
            if (cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private void saveFailedHistory(String fileName, String sheetName, String uploadedBy, String error) {
        uploadHistoryRepository.save(UploadHistory.builder()
                .fileName(fileName)
                .sheetName(sheetName)
                .recordsImported(0)
                .uploadedBy(uploadedBy)
                .status("FAILED")
                .errorMessage(error)
                .build());
    }
}
