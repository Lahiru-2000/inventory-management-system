package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.SalesOrderDTO;
import com.InventoryFlow.InventoryFlow.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sales-orders")
@CrossOrigin(origins = "*")
public class SalesOrderController {

    @Autowired
    private SalesOrderService soService;

    @PostMapping
    public ResponseEntity<ApiResponse<SalesOrderDTO>> createSalesOrder(@Valid @RequestBody SalesOrderDTO soDTO) {
        try {
            SalesOrderDTO created = soService.createSalesOrder(soDTO);
            return ResponseEntity.ok(ApiResponse.success("Sales Order created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalesOrderDTO>>> getAllSalesOrders() {
        List<SalesOrderDTO> sos = soService.getAllSalesOrders();
        return ResponseEntity.ok(ApiResponse.success(sos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderDTO>> getSalesOrderById(@PathVariable Long id) {
        try {
            SalesOrderDTO so = soService.getSalesOrderById(id);
            return ResponseEntity.ok(ApiResponse.success(so));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalesOrderDTO>> updateSalesOrder(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderDTO soDTO) {
        try {
            SalesOrderDTO updated = soService.updateSalesOrder(id, soDTO);
            return ResponseEntity.ok(ApiResponse.success("Sales Order updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SalesOrderDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam(value = "status", required = true) String status) {
        try {
            SalesOrderDTO updated = soService.updateSalesOrderStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


