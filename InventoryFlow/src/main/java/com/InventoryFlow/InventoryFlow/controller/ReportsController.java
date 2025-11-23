package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.PurchaseReportDTO;
import com.InventoryFlow.InventoryFlow.dto.SalesReportDTO;
import com.InventoryFlow.InventoryFlow.dto.SupplierPurchaseHistoryDTO;
import com.InventoryFlow.InventoryFlow.service.ReportsService;
import com.InventoryFlow.InventoryFlow.service.ReportExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @Autowired
    private ReportExportService reportExportService;

    @GetMapping("/stock")
    public ResponseEntity<ApiResponse<?>> getStockReport() {
        var report = reportsService.getStockReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<?>> getLowStockReport() {
        var report = reportsService.getLowStockReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/purchase")
    public ResponseEntity<ApiResponse<List<PurchaseReportDTO>>> getPurchaseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PurchaseReportDTO> report = reportsService.getPurchaseReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<List<SalesReportDTO>>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<SalesReportDTO> report = reportsService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/supplier/{supplierId}/purchase-history")
    public ResponseEntity<ApiResponse<List<SupplierPurchaseHistoryDTO>>> getSupplierPurchaseHistory(@PathVariable Long supplierId) {
        List<SupplierPurchaseHistoryDTO> report = reportsService.getSupplierPurchaseHistory(supplierId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/profit")
    public ResponseEntity<ApiResponse<BigDecimal>> getProfitReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BigDecimal profit = reportsService.getProfitReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(profit));
    }

    // PDF Export Endpoints
    @GetMapping("/export/stock/pdf")
    public ResponseEntity<byte[]> exportStockReportPDF() {
        try {
            byte[] pdfBytes = reportExportService.exportStockReportToPDF();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "stock-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/low-stock/pdf")
    public ResponseEntity<byte[]> exportLowStockReportPDF() {
        try {
            byte[] pdfBytes = reportExportService.exportLowStockReportToPDF();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "low-stock-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/purchase/pdf")
    public ResponseEntity<byte[]> exportPurchaseReportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] pdfBytes = reportExportService.exportPurchaseReportToPDF(startDate, endDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "purchase-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/sales/pdf")
    public ResponseEntity<byte[]> exportSalesReportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] pdfBytes = reportExportService.exportSalesReportToPDF(startDate, endDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "sales-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/profit/pdf")
    public ResponseEntity<byte[]> exportProfitReportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] pdfBytes = reportExportService.exportProfitReportToPDF(startDate, endDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "profit-report.pdf");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Excel Export Endpoints
    @GetMapping("/export/stock/excel")
    public ResponseEntity<byte[]> exportStockReportExcel() {
        try {
            byte[] excelBytes = reportExportService.exportStockReportToExcel();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "stock-report.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/low-stock/excel")
    public ResponseEntity<byte[]> exportLowStockReportExcel() {
        try {
            byte[] excelBytes = reportExportService.exportLowStockReportToExcel();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "low-stock-report.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/purchase/excel")
    public ResponseEntity<byte[]> exportPurchaseReportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] excelBytes = reportExportService.exportPurchaseReportToExcel(startDate, endDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "purchase-report.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/sales/excel")
    public ResponseEntity<byte[]> exportSalesReportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] excelBytes = reportExportService.exportSalesReportToExcel(startDate, endDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "sales-report.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}


