package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNLineDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemSku;
    private Integer quantityOrdered;
    private Integer quantityReceived;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}


