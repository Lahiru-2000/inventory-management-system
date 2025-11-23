package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDTO {
    private Long id;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private LocalDate orderDate;
    private LocalDate dueDate;
    private String status;
    private String remarks;
    private Long createdById;
    private String createdByName;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime createdAt;
    private List<PurchaseOrderLineDTO> orderLines;
}


