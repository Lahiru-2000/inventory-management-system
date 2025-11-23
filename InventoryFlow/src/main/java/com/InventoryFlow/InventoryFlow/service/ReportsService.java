package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.ItemDTO;
import com.InventoryFlow.InventoryFlow.dto.PurchaseReportDTO;
import com.InventoryFlow.InventoryFlow.dto.SalesReportDTO;
import com.InventoryFlow.InventoryFlow.dto.StockDTO;
import com.InventoryFlow.InventoryFlow.dto.SupplierPurchaseHistoryDTO;
import com.InventoryFlow.InventoryFlow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    @Autowired
    private ItemService itemService;

    @Autowired
    private StockService stockService;

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public List<StockDTO> getStockReport() {
        return stockService.getAllStocks();
    }

    public List<ItemDTO> getLowStockReport() {
        return itemService.getLowStockItems();
    }

    public List<PurchaseReportDTO> getPurchaseReport(LocalDate startDate, LocalDate endDate) {
        return poRepository.findByOrderDateBetween(startDate, endDate).stream()
                .map(po -> new PurchaseReportDTO(
                        po.getPoNumber(),
                        po.getSupplier().getName(),
                        po.getOrderDate(),
                        po.getStatus().name()
                ))
                .collect(Collectors.toList());
    }

    public List<SalesReportDTO> getSalesReport(LocalDate startDate, LocalDate endDate) {
        return salesOrderRepository.findByOrderDateBetween(startDate, endDate).stream()
                .map(so -> new SalesReportDTO(
                        so.getSoNumber(),
                        so.getCustomerName(),
                        so.getOrderDate(),
                        so.getTotalAmount(),
                        so.getStatus().name()
                ))
                .collect(Collectors.toList());
    }

    public List<SupplierPurchaseHistoryDTO> getSupplierPurchaseHistory(Long supplierId) {
        return poRepository.findBySupplierId(supplierId).stream()
                .map(po -> new SupplierPurchaseHistoryDTO(
                        po.getPoNumber(),
                        po.getOrderDate(),
                        po.getStatus().name()
                ))
                .collect(Collectors.toList());
    }

    public BigDecimal getProfitReport(LocalDate startDate, LocalDate endDate) {
        // Calculate profit: sales - cost
        BigDecimal sales = salesOrderRepository.getTotalSalesBetween(startDate, endDate);
        if (sales == null) sales = BigDecimal.ZERO;
        
        // TODO: Calculate cost from GRN or PO
        BigDecimal cost = BigDecimal.ZERO;
        
        return sales.subtract(cost);
    }
}


