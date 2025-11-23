package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderDTO {
    private Long id;
    private String soNumber;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private String customerName;
    private String customerAddress;
    private String customerPhone;
    private String status;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private String remarks;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<SalesOrderLineDTO> orderLines;
}


