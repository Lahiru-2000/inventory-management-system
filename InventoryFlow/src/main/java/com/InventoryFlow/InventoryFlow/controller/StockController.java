package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.StockDTO;
import com.InventoryFlow.InventoryFlow.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/stocks")
@CrossOrigin(origins = "*")
public class StockController {

    @Autowired
    private StockService stockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockDTO>>> getAllStocks() {
        List<StockDTO> stocks = stockService.getAllStocks();
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<ApiResponse<StockDTO>> getStockByItemId(@PathVariable Long itemId) {
        try {
            StockDTO stock = stockService.getStockByItemId(itemId);
            return ResponseEntity.ok(ApiResponse.success(stock));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/adjust/{itemId}")
    public ResponseEntity<ApiResponse<StockDTO>> adjustStock(
            @PathVariable Long itemId,
            @RequestParam Integer newQuantity,
            @RequestParam String reason,
            @RequestParam Long adjustedById) {
        try {
            StockDTO adjusted = stockService.adjustStock(itemId, newQuantity, reason, adjustedById);
            return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", adjusted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/total-value")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalStockValue() {
        BigDecimal value = stockService.getTotalStockValue();
        return ResponseEntity.ok(ApiResponse.success(value));
    }
}


