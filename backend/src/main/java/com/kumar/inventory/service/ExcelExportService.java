package com.kumar.inventory.service;

import com.kumar.inventory.dto.response.InventoryItemDto;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Generates an Excel (.xlsx) file from a list of InventoryItemDto objects.
 * Used by the export endpoint to let users download search results.
 */
@Slf4j
@Service
public class ExcelExportService {

    private static final String[] HEADERS = {
            "Model", "DMS Code", "Model Description", "Basic Price",
            "SGST @ 9%", "CGST @ 9%", "Ex-Showroom Price", "RTO Charges",
            "Smart Card Rc", "Post Sales Handling Charges", "Insurance - Vehicle (1+5)",
            "Accessories", "On Road Price", "Basic Insurance", "Difference",
            "VMC", "Date", "Short Code", "Model Name"
    };

    public byte[] exportToExcel(List<InventoryItemDto> items, String keyword) throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Inventory Export");

            // ── Header style ────────────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // ── Zebra stripe styles ─────────────────────────────────────────
            CellStyle evenRowStyle = workbook.createCellStyle();
            evenRowStyle.setFillForegroundColor(IndexedColors.WHITE.getIndex());
            evenRowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle oddRowStyle = workbook.createCellStyle();
            oddRowStyle.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            oddRowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle numberStyle = workbook.createCellStyle();
            numberStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));

            // ── Header row ──────────────────────────────────────────────────
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // ── Data rows ───────────────────────────────────────────────────
            for (int i = 0; i < items.size(); i++) {
                InventoryItemDto item = items.get(i);
                Row row = sheet.createRow(i + 1);
                CellStyle rowStyle = (i % 2 == 0) ? evenRowStyle : oddRowStyle;

                int col = 0;
                setCellValue(row, col++, item.getModel(), rowStyle);
                setCellValue(row, col++, item.getDmsCode(), rowStyle);
                setCellValue(row, col++, item.getModelDescription(), rowStyle);
                setCellDecimal(row, col++, item.getBasicPrice(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getSgst(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getCgst(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getExShowroomPrice(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getRtoCharges(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getSmartCardRc(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getPostSalesHandlingCharges(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getInsuranceVehicle(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getAccessories(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getOnRoadPrice(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getBasicInsurance(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getDifference(), rowStyle, numberStyle);
                setCellDecimal(row, col++, item.getVmc(), rowStyle, numberStyle);
                setCellValue(row, col++, item.getDate() != null ? item.getDate().toString() : "", rowStyle);
                setCellValue(row, col++, item.getShortCode(), rowStyle);
                setCellValue(row, col, item.getModelName(), rowStyle);
            }

            // ── Auto-size first 3 text columns ─────────────────────────────
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);

            workbook.write(out);
            log.info("Exported {} records to Excel (keyword='{}')", items.size(), keyword);
            return out.toByteArray();
        }
    }

    private void setCellValue(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void setCellDecimal(Row row, int col, BigDecimal value, CellStyle baseStyle, CellStyle numberStyle) {
        Cell cell = row.createCell(col);
        if (value != null) {
            cell.setCellValue(value.doubleValue());
            cell.setCellStyle(numberStyle);
        } else {
            cell.setCellStyle(baseStyle);
        }
    }
}
