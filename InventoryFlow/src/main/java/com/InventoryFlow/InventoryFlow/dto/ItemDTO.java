package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {
    private Long id;
    private String name;
    private String sku;
    private Long categoryId;
    private String categoryName;
    private String unit;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer reorderLevel;
    private Integer active; // 1 for active, 0 for inactive
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


