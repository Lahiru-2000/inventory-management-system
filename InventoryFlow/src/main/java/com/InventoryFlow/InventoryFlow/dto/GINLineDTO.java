package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GINLineDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private Integer quantityOrdered;
    private Integer quantityIssued;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}


