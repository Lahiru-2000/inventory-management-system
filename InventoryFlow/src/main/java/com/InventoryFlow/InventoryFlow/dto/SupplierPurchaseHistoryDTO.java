package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierPurchaseHistoryDTO {
    private String poNumber;
    private LocalDate orderDate;
    private String status;
}


