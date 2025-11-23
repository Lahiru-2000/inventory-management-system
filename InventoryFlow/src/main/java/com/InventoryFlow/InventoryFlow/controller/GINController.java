package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.GoodsIssueNoteDTO;
import com.InventoryFlow.InventoryFlow.service.GoodsIssueNoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gins")
@CrossOrigin(origins = "*")
public class GINController {

    @Autowired
    private GoodsIssueNoteService ginService;

    @PostMapping("/so/{soId}")
    public ResponseEntity<ApiResponse<GoodsIssueNoteDTO>> createGINFromSO(
            @PathVariable Long soId,
            @Valid @RequestBody GoodsIssueNoteDTO ginDTO) {
        try {
            GoodsIssueNoteDTO created = ginService.createGINFromSO(soId, ginDTO);
            return ResponseEntity.ok(ApiResponse.success("GIN created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoodsIssueNoteDTO>>> getAllGINs() {
        List<GoodsIssueNoteDTO> gins = ginService.getAllGINs();
        return ResponseEntity.ok(ApiResponse.success(gins));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsIssueNoteDTO>> getGINById(@PathVariable Long id) {
        try {
            GoodsIssueNoteDTO gin = ginService.getGINById(id);
            return ResponseEntity.ok(ApiResponse.success(gin));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsIssueNoteDTO>> updateGIN(
            @PathVariable Long id,
            @Valid @RequestBody GoodsIssueNoteDTO ginDTO) {
        try {
            GoodsIssueNoteDTO updated = ginService.updateGIN(id, ginDTO);
            return ResponseEntity.ok(ApiResponse.success("GIN updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<GoodsIssueNoteDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam(value = "status", required = true) String status) {
        try {
            GoodsIssueNoteDTO updated = ginService.updateGINStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


