package com.InventoryFlow.InventoryFlow.controller;

import com.InventoryFlow.InventoryFlow.dto.ApiResponse;
import com.InventoryFlow.InventoryFlow.dto.ItemDTO;
import com.InventoryFlow.InventoryFlow.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItemDTO>> createItem(@Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO created = itemService.createItem(itemDTO);
            return ResponseEntity.ok(ApiResponse.success("Item created successfully", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemDTO>>> getAllItems() {
        List<ItemDTO> items = itemService.getAllItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ItemDTO>>> getActiveItems() {
        List<ItemDTO> items = itemService.getActiveItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ItemDTO>>> getLowStockItems() {
        List<ItemDTO> items = itemService.getLowStockItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDTO>> getItemById(@PathVariable Long id) {
        try {
            ItemDTO item = itemService.getItemById(id);
            return ResponseEntity.ok(ApiResponse.success(item));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemDTO>> updateItem(@PathVariable Long id, @Valid @RequestBody ItemDTO itemDTO) {
        try {
            ItemDTO updated = itemService.updateItem(id, itemDTO);
            return ResponseEntity.ok(ApiResponse.success("Item updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


