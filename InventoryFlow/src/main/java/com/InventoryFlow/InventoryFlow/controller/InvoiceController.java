package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.InvoiceDTO;
import com.InventoryFlow.InventoryFlow.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/so/{soId}")
    public ResponseEntity<ApiResponse<InvoiceDTO>> createInvoiceFromSO(
            @PathVariable Long soId,
            @Valid @RequestBody InvoiceDTO invoiceDTO) {
        try {
            InvoiceDTO created = invoiceService.createInvoiceFromSO(soId, invoiceDTO);
            return ResponseEntity.ok(ApiResponse.success("Invoice created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceDTO>>> getAllInvoices() {
        List<InvoiceDTO> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(invoices));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getInvoiceById(@PathVariable Long id) {
        try {
            InvoiceDTO invoice = invoiceService.getInvoiceById(id);
            return ResponseEntity.ok(ApiResponse.success(invoice));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<ApiResponse<InvoiceDTO>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String paymentStatus) {
        try {
            InvoiceDTO updated = invoiceService.updatePaymentStatus(id, paymentStatus);
            return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


