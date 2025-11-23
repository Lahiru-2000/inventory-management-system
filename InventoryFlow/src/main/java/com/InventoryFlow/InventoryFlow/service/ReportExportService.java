package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExportService {

    @Autowired
    private ReportsService reportsService;

    // PDF Export Methods
    public byte[] exportStockReportToPDF() throws Exception {
        List<StockDTO> stocks = reportsService.getStockReport();
        return generateStockReportPDF(stocks);
    }

    public byte[] exportLowStockReportToPDF() throws Exception {
        List<ItemDTO> items = reportsService.getLowStockReport();
        return generateLowStockReportPDF(items);
    }

    public byte[] exportPurchaseReportToPDF(LocalDate startDate, LocalDate endDate) throws Exception {
        List<PurchaseReportDTO> purchases = reportsService.getPurchaseReport(startDate, endDate);
        return generatePurchaseReportPDF(purchases, startDate, endDate);
    }

    public byte[] exportSalesReportToPDF(LocalDate startDate, LocalDate endDate) throws Exception {
        List<SalesReportDTO> sales = reportsService.getSalesReport(startDate, endDate);
        return generateSalesReportPDF(sales, startDate, endDate);
    }

    public byte[] exportProfitReportToPDF(LocalDate startDate, LocalDate endDate) throws Exception {
        BigDecimal profit = reportsService.getProfitReport(startDate, endDate);
        return generateProfitReportPDF(profit, startDate, endDate);
    }

    // Excel Export Methods
    public byte[] exportStockReportToExcel() throws Exception {
        List<StockDTO> stocks = reportsService.getStockReport();
        return generateStockReportExcel(stocks);
    }

    public byte[] exportLowStockReportToExcel() throws Exception {
        List<ItemDTO> items = reportsService.getLowStockReport();
        return generateLowStockReportExcel(items);
    }

    public byte[] exportPurchaseReportToExcel(LocalDate startDate, LocalDate endDate) throws Exception {
        List<PurchaseReportDTO> purchases = reportsService.getPurchaseReport(startDate, endDate);
        return generatePurchaseReportExcel(purchases, startDate, endDate);
    }

    public byte[] exportSalesReportToExcel(LocalDate startDate, LocalDate endDate) throws Exception {
        List<SalesReportDTO> sales = reportsService.getSalesReport(startDate, endDate);
        return generateSalesReportExcel(sales, startDate, endDate);
    }

    // Private PDF Generation Methods
    private byte[] generateStockReportPDF(List<StockDTO> stocks) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        addTitle(document, "Stock Report");

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        addTableHeader(table, "Item Name", "SKU", "Category", "Quantity", "Stock Value");

        for (StockDTO stock : stocks) {
            addTableCell(table, stock.getItemName());
            addTableCell(table, stock.getItemSku());
            addTableCell(table, stock.getCategoryName());
            addTableCell(table, String.valueOf(stock.getQuantityOnHand()));
            addTableCell(table, "$" + stock.getStockValue().setScale(2, RoundingMode.HALF_UP));
        }

        document.add(table);
        document.add(new Paragraph("\nTotal Items: " + stocks.size()));
        addFooter(document);
        document.close();

        return baos.toByteArray();
    }

    private byte[] generateLowStockReportPDF(List<ItemDTO> items) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        addTitle(document, "Low Stock Items Report");

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        addTableHeader(table, "Item Name", "SKU", "Reorder Level", "Current Stock");

        for (ItemDTO item : items) {
            addTableCell(table, item.getName());
            addTableCell(table, item.getSku());
            addTableCell(table, String.valueOf(item.getReorderLevel()));
            // Note: Would need to get current stock from StockService
            addTableCell(table, "N/A");
        }

        document.add(table);
        document.add(new Paragraph("\nTotal Low Stock Items: " + items.size()));
        addFooter(document);
        document.close();

        return baos.toByteArray();
    }

    private byte[] generatePurchaseReportPDF(List<PurchaseReportDTO> purchases, LocalDate startDate, LocalDate endDate) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        addTitle(document, "Purchase Report");
        document.add(new Paragraph("Period: " + startDate + " to " + endDate + "\n"));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        addTableHeader(table, "PO Number", "Supplier", "Order Date", "Status");

        for (PurchaseReportDTO purchase : purchases) {
            addTableCell(table, purchase.getPoNumber());
            addTableCell(table, purchase.getSupplierName());
            addTableCell(table, purchase.getOrderDate().toString());
            addTableCell(table, purchase.getStatus());
        }

        document.add(table);
        document.add(new Paragraph("\nTotal Purchase Orders: " + purchases.size()));
        addFooter(document);
        document.close();

        return baos.toByteArray();
    }

    private byte[] generateSalesReportPDF(List<SalesReportDTO> sales, LocalDate startDate, LocalDate endDate) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        addTitle(document, "Sales Report");
        document.add(new Paragraph("Period: " + startDate + " to " + endDate + "\n"));

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        addTableHeader(table, "SO Number", "Customer", "Order Date", "Total Amount", "Status");

        BigDecimal totalSales = BigDecimal.ZERO;
        for (SalesReportDTO sale : sales) {
            addTableCell(table, sale.getSoNumber());
            addTableCell(table, sale.getCustomerName());
            addTableCell(table, sale.getOrderDate().toString());
            addTableCell(table, "$" + sale.getTotalAmount().setScale(2, RoundingMode.HALF_UP));
            addTableCell(table, sale.getStatus());
            totalSales = totalSales.add(sale.getTotalAmount());
        }

        document.add(table);
        document.add(new Paragraph("\nTotal Sales Orders: " + sales.size()));
        document.add(new Paragraph("Total Sales Amount: $" + totalSales.setScale(2, RoundingMode.HALF_UP)));
        addFooter(document);
        document.close();

        return baos.toByteArray();
    }

    private byte[] generateProfitReportPDF(BigDecimal profit, LocalDate startDate, LocalDate endDate) throws Exception {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);
        document.open();

        addTitle(document, "Profit Report");
        document.add(new Paragraph("Period: " + startDate + " to " + endDate + "\n"));
        document.add(new Paragraph("\nTotal Profit: $" + profit.setScale(2, RoundingMode.HALF_UP)));
        addFooter(document);
        document.close();

        return baos.toByteArray();
    }

    // Private Excel Generation Methods
    private byte[] generateStockReportExcel(List<StockDTO> stocks) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Stock Report");

        // Header
        Row headerRow = sheet.createRow(0);
        createCell(headerRow, 0, "Item Name", workbook);
        createCell(headerRow, 1, "SKU", workbook);
        createCell(headerRow, 2, "Category", workbook);
        createCell(headerRow, 3, "Quantity", workbook);
        createCell(headerRow, 4, "Stock Value", workbook);

        // Data
        int rowNum = 1;
        for (StockDTO stock : stocks) {
            Row row = sheet.createRow(rowNum++);
            createCell(row, 0, stock.getItemName(), workbook);
            createCell(row, 1, stock.getItemSku(), workbook);
            createCell(row, 2, stock.getCategoryName(), workbook);
            createCell(row, 3, stock.getQuantityOnHand(), workbook);
            createCell(row, 4, stock.getStockValue().doubleValue(), workbook);
        }

        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    private byte[] generateLowStockReportExcel(List<ItemDTO> items) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Low Stock Report");

        Row headerRow = sheet.createRow(0);
        createCell(headerRow, 0, "Item Name", workbook);
        createCell(headerRow, 1, "SKU", workbook);
        createCell(headerRow, 2, "Reorder Level", workbook);
        createCell(headerRow, 3, "Current Stock", workbook);

        int rowNum = 1;
        for (ItemDTO item : items) {
            Row row = sheet.createRow(rowNum++);
            createCell(row, 0, item.getName(), workbook);
            createCell(row, 1, item.getSku(), workbook);
            createCell(row, 2, item.getReorderLevel(), workbook);
            createCell(row, 3, "N/A", workbook);
        }

        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    private byte[] generatePurchaseReportExcel(List<PurchaseReportDTO> purchases, LocalDate startDate, LocalDate endDate) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Purchase Report");

        Row titleRow = sheet.createRow(0);
        createCell(titleRow, 0, "Purchase Report", workbook);
        Row periodRow = sheet.createRow(1);
        createCell(periodRow, 0, "Period: " + startDate + " to " + endDate, workbook);

        Row headerRow = sheet.createRow(3);
        createCell(headerRow, 0, "PO Number", workbook);
        createCell(headerRow, 1, "Supplier", workbook);
        createCell(headerRow, 2, "Order Date", workbook);
        createCell(headerRow, 3, "Status", workbook);

        int rowNum = 4;
        for (PurchaseReportDTO purchase : purchases) {
            Row row = sheet.createRow(rowNum++);
            createCell(row, 0, purchase.getPoNumber(), workbook);
            createCell(row, 1, purchase.getSupplierName(), workbook);
            createCell(row, 2, purchase.getOrderDate().toString(), workbook);
            createCell(row, 3, purchase.getStatus(), workbook);
        }

        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    private byte[] generateSalesReportExcel(List<SalesReportDTO> sales, LocalDate startDate, LocalDate endDate) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sales Report");

        Row titleRow = sheet.createRow(0);
        createCell(titleRow, 0, "Sales Report", workbook);
        Row periodRow = sheet.createRow(1);
        createCell(periodRow, 0, "Period: " + startDate + " to " + endDate, workbook);

        Row headerRow = sheet.createRow(3);
        createCell(headerRow, 0, "SO Number", workbook);
        createCell(headerRow, 1, "Customer", workbook);
        createCell(headerRow, 2, "Order Date", workbook);
        createCell(headerRow, 3, "Total Amount", workbook);
        createCell(headerRow, 4, "Status", workbook);

        int rowNum = 4;
        BigDecimal totalSales = BigDecimal.ZERO;
        for (SalesReportDTO sale : sales) {
            Row row = sheet.createRow(rowNum++);
            createCell(row, 0, sale.getSoNumber(), workbook);
            createCell(row, 1, sale.getCustomerName(), workbook);
            createCell(row, 2, sale.getOrderDate().toString(), workbook);
            createCell(row, 3, sale.getTotalAmount().doubleValue(), workbook);
            createCell(row, 4, sale.getStatus(), workbook);
            totalSales = totalSales.add(sale.getTotalAmount());
        }

        Row totalRow = sheet.createRow(rowNum);
        createCell(totalRow, 3, "Total: $" + totalSales.setScale(2, RoundingMode.HALF_UP), workbook);

        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();

        return baos.toByteArray();
    }

    // Helper methods for PDF
    private void addTitle(Document document, String title) throws Exception {
        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph titlePara = new Paragraph(title, titleFont);
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingAfter(20);
        document.add(titlePara);
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String content) {
        PdfPCell cell = new PdfPCell(new Phrase(content));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addFooter(Document document) throws Exception {
        document.add(new Paragraph("\n\nGenerated on: " + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                FontFactory.getFont(FontFactory.HELVETICA, 8)));
    }

    // Helper methods for Excel
    private void createCell(Row row, int column, Object value, Workbook workbook) {
        Cell cell = row.createCell(column);
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        if (value instanceof String) {
            cell.setCellValue((String) value);
            if (row.getRowNum() == 0 || row.getRowNum() == 3) {
                cell.setCellStyle(headerStyle);
            }
        } else if (value instanceof Integer) {
            cell.setCellValue((Integer) value);
        } else if (value instanceof Double || value instanceof BigDecimal) {
            cell.setCellValue(value instanceof BigDecimal ? ((BigDecimal) value).doubleValue() : (Double) value);
        }
    }
}

