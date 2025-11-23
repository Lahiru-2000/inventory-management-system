package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportDTO {
    private String soNumber;
    private String customerName;
    private LocalDate orderDate;
    private BigDecimal totalAmount;
    private String status;
}


