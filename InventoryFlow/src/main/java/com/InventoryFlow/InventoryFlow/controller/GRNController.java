package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.GoodsReceiveNoteDTO;
import com.InventoryFlow.InventoryFlow.service.GoodsReceiveNoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grns")
@CrossOrigin(origins = "*")
public class GRNController {

    @Autowired
    private GoodsReceiveNoteService grnService;

    @PostMapping("/po/{poId}")
    public ResponseEntity<ApiResponse<GoodsReceiveNoteDTO>> createGRNFromPO(
            @PathVariable Long poId, 
            @Valid @RequestBody GoodsReceiveNoteDTO grnDTO) {
        try {
            GoodsReceiveNoteDTO created = grnService.createGRNFromPO(poId, grnDTO);
            return ResponseEntity.ok(ApiResponse.success("GRN created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoodsReceiveNoteDTO>>> getAllGRNs() {
        List<GoodsReceiveNoteDTO> grns = grnService.getAllGRNs();
        return ResponseEntity.ok(ApiResponse.success(grns));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsReceiveNoteDTO>> getGRNById(@PathVariable Long id) {
        try {
            GoodsReceiveNoteDTO grn = grnService.getGRNById(id);
            return ResponseEntity.ok(ApiResponse.success(grn));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


