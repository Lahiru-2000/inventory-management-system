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
public class GoodsIssueNoteDTO {
    private Long id;
    private String ginNumber;
    private Long salesOrderId;
    private String soNumber;
    private LocalDate issueDate;
    private String remarks;
    private Long issuedById;
    private String issuedByName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GINLineDTO> ginLines;
}


