package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseReportDTO {
    private String poNumber;
    private String supplierName;
    private LocalDate orderDate;
    private String status;
}


