package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.PurchaseOrderDTO;
import com.InventoryFlow.InventoryFlow.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService poService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createPO(@Valid @RequestBody PurchaseOrderDTO poDTO) {
        try {
            PurchaseOrderDTO created = poService.createPO(poDTO);
            return ResponseEntity.ok(ApiResponse.success("Purchase Order created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> approvePO(@PathVariable Long id, @RequestParam Long approvedById) {
        try {
            PurchaseOrderDTO approved = poService.approvePO(id, approvedById);
            return ResponseEntity.ok(ApiResponse.success("PO approved successfully", approved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> rejectPO(@PathVariable Long id, @RequestParam Long rejectedById) {
        try {
            PurchaseOrderDTO rejected = poService.rejectPO(id, rejectedById);
            return ResponseEntity.ok(ApiResponse.success("PO rejected successfully", rejected));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> updatePO(@PathVariable Long id, @Valid @RequestBody PurchaseOrderDTO poDTO) {
        try {
            PurchaseOrderDTO updated = poService.updatePO(id, poDTO);
            return ResponseEntity.ok(ApiResponse.success("Purchase Order updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getAllPOs() {
        List<PurchaseOrderDTO> pos = poService.getAllPOs();
        return ResponseEntity.ok(ApiResponse.success(pos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPOById(@PathVariable Long id) {
        try {
            PurchaseOrderDTO po = poService.getPOById(id);
            return ResponseEntity.ok(ApiResponse.success(po));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


