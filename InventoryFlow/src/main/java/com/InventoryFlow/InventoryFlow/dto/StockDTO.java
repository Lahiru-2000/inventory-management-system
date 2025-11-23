package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private String categoryName;
    private Integer quantityOnHand;
    private BigDecimal unitCostPrice;
    private BigDecimal stockValue;
}


