package com.InventoryFlow.InventoryFlow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private Long totalItems;
    private Long totalSuppliers;
    private BigDecimal stockValue;
    private BigDecimal monthlySales;
    private List<LowStockItemDTO> lowStockItems;
    private List<MonthlySalesDTO> monthlySalesData;
    private List<POvsSODTO> poVsSoData;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockItemDTO {
        private Long itemId;
        private String itemName;
        private String sku;
        private Integer currentStock;
        private Integer reorderLevel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySalesDTO {
        private String month;
        private BigDecimal sales;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class POvsSODTO {
        private String month;
        private BigDecimal purchaseAmount;
        private BigDecimal salesAmount;
    }
}

