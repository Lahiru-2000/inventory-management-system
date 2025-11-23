package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.DashboardDTO;
import com.InventoryFlow.InventoryFlow.dto.ItemDTO;
import com.InventoryFlow.InventoryFlow.dto.StockDTO;
import com.InventoryFlow.InventoryFlow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private ItemService itemService;

    public DashboardDTO getDashboardData() {
        DashboardDTO dashboard = new DashboardDTO();

        // Basic counts
        dashboard.setTotalItems(itemRepository.count());
        dashboard.setTotalSuppliers(supplierRepository.count());

        // Stock value
        BigDecimal stockValue = stockRepository.getTotalStockValue();
        dashboard.setStockValue(stockValue != null ? stockValue : BigDecimal.ZERO);

        // Monthly sales (current month)
        LocalDate startOfMonth = YearMonth.now().atDay(1);
        LocalDate endOfMonth = YearMonth.now().atEndOfMonth();
        BigDecimal monthlySales = salesOrderRepository.getTotalSalesBetween(startOfMonth, endOfMonth);
        dashboard.setMonthlySales(monthlySales != null ? monthlySales : BigDecimal.ZERO);

        // Low stock items
        List<ItemDTO> lowStockItems = itemService.getLowStockItems();
        List<DashboardDTO.LowStockItemDTO> lowStockDTOs = lowStockItems.stream()
                .map(item -> {
                    StockDTO stock = stockService.getStockByItemId(item.getId());
                    DashboardDTO.LowStockItemDTO dto = new DashboardDTO.LowStockItemDTO();
                    dto.setItemId(item.getId());
                    dto.setItemName(item.getName());
                    dto.setSku(item.getSku());
                    dto.setCurrentStock(stock.getQuantityOnHand());
                    dto.setReorderLevel(item.getReorderLevel());
                    return dto;
                })
                .collect(Collectors.toList());
        dashboard.setLowStockItems(lowStockDTOs);

        // Monthly sales data (last 12 months)
        List<DashboardDTO.MonthlySalesDTO> monthlySalesData = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();
            BigDecimal sales = salesOrderRepository.getTotalSalesBetween(start, end);
            DashboardDTO.MonthlySalesDTO dto = new DashboardDTO.MonthlySalesDTO();
            dto.setMonth(month.toString());
            dto.setSales(sales != null ? sales : BigDecimal.ZERO);
            monthlySalesData.add(dto);
        }
        dashboard.setMonthlySalesData(monthlySalesData);

        // PO vs SO data (simplified - you may need to add PO total calculation)
        List<DashboardDTO.POvsSODTO> poVsSoData = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();
            BigDecimal sales = salesOrderRepository.getTotalSalesBetween(start, end);
            DashboardDTO.POvsSODTO dto = new DashboardDTO.POvsSODTO();
            dto.setMonth(month.toString());
            dto.setPurchaseAmount(BigDecimal.ZERO); // TODO: Calculate PO totals
            dto.setSalesAmount(sales != null ? sales : BigDecimal.ZERO);
            poVsSoData.add(dto);
        }
        dashboard.setPoVsSoData(poVsSoData);

        return dashboard;
    }
}

