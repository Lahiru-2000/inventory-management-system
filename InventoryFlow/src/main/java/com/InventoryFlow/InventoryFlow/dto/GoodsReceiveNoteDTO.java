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
public class GoodsReceiveNoteDTO {
    private Long id;
    private String grnNumber;
    private Long purchaseOrderId;
    private String poNumber;
    private LocalDate receiveDate;
    private String remarks;
    private Long receivedById;
    private String receivedByName;
    private LocalDateTime createdAt;
    private List<GRNLineDTO> grnLines;
}


