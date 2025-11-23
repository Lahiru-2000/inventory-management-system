package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.StockDTO;
import com.InventoryFlow.InventoryFlow.entity.Item;
import com.InventoryFlow.InventoryFlow.entity.Stock;
import com.InventoryFlow.InventoryFlow.entity.StockAdjustment;
import com.InventoryFlow.InventoryFlow.entity.User;
import com.InventoryFlow.InventoryFlow.repository.ItemRepository;
import com.InventoryFlow.InventoryFlow.repository.StockAdjustmentRepository;
import com.InventoryFlow.InventoryFlow.repository.StockRepository;
import com.InventoryFlow.InventoryFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StockAdjustmentRepository adjustmentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StockDTO> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StockDTO getStockByItemId(Long itemId) {
        Stock stock = stockRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Stock not found for item"));
        return convertToDTO(stock);
    }

    public void updateStock(Long itemId, Integer quantity) {
        Stock stock = stockRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
        stock.setQuantityOnHand(stock.getQuantityOnHand() + quantity);
        stockRepository.save(stock);
    }

    public StockDTO adjustStock(Long itemId, Integer newQuantity, String reason, Long adjustedById) {
        Stock stock = stockRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        User adjustedBy = userRepository.findById(adjustedById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer previousQuantity = stock.getQuantityOnHand();
        Integer adjustedQuantity = newQuantity - previousQuantity;

        StockAdjustment adjustment = new StockAdjustment();
        adjustment.setItem(stock.getItem());
        adjustment.setPreviousQuantity(previousQuantity);
        adjustment.setAdjustedQuantity(adjustedQuantity);
        adjustment.setNewQuantity(newQuantity);
        adjustment.setReason(reason);
        adjustment.setAdjustedBy(adjustedBy);

        adjustmentRepository.save(adjustment);

        stock.setQuantityOnHand(newQuantity);
        Stock updated = stockRepository.save(stock);

        return convertToDTO(updated);
    }

    public BigDecimal getTotalStockValue() {
        BigDecimal value = stockRepository.getTotalStockValue();
        return value != null ? value : BigDecimal.ZERO;
    }

    private StockDTO convertToDTO(Stock stock) {
        StockDTO dto = new StockDTO();
        dto.setId(stock.getId());
        dto.setItemId(stock.getItem().getId());
        dto.setItemName(stock.getItem().getName());
        dto.setItemSku(stock.getItem().getSku());
        dto.setCategoryName(stock.getItem().getCategory().getName());
        dto.setQuantityOnHand(stock.getQuantityOnHand());
        dto.setUnitCostPrice(stock.getItem().getCostPrice());
        dto.setStockValue(stock.getStockValue());
        return dto;
    }
}


