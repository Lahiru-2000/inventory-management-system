package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.GoodsIssueNoteDTO;
import com.InventoryFlow.InventoryFlow.dto.GINLineDTO;
import com.InventoryFlow.InventoryFlow.entity.*;
import com.InventoryFlow.InventoryFlow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoodsIssueNoteService {

    @Autowired
    private GoodsIssueNoteRepository ginRepository;

    @Autowired
    private SalesOrderRepository soRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    public GoodsIssueNoteDTO createGINFromSO(Long soId, GoodsIssueNoteDTO ginDTO) {
        SalesOrder so = soRepository.findById(soId)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (so.getStatus() == SalesOrder.SOStatus.DRAFT) {
            throw new RuntimeException("Sales Order must be CONFIRMED to create GIN");
        }

        User issuedBy = userRepository.findById(ginDTO.getIssuedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GoodsIssueNote gin = new GoodsIssueNote();
        gin.setGinNumber(generateGINNumber());
        gin.setSalesOrder(so);
        gin.setIssueDate(ginDTO.getIssueDate() != null ? ginDTO.getIssueDate() : LocalDate.now());
        gin.setRemarks(ginDTO.getRemarks());
        gin.setIssuedBy(issuedBy);
        gin.setStatus(GoodsIssueNote.GINStatus.DRAFT);

        for (GINLineDTO lineDTO : ginDTO.getGinLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in GIN");
            }

            Stock stock = stockRepository.findByItemId(item.getId())
                    .orElseThrow(() -> new RuntimeException("Stock not found"));

            if (stock.getQuantityOnHand() < lineDTO.getQuantityIssued()) {
                throw new RuntimeException("Insufficient stock for item: " + item.getName());
            }

            GINLine line = new GINLine();
            line.setGin(gin);
            line.setItem(item);
            line.setQuantityOrdered(lineDTO.getQuantityOrdered());
            line.setQuantityIssued(lineDTO.getQuantityIssued());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantityIssued())));
            gin.getGinLines().add(line);

            // Reduce stock
            stock.setQuantityOnHand(stock.getQuantityOnHand() - lineDTO.getQuantityIssued());
            stockRepository.save(stock);
        }

        GoodsIssueNote saved = ginRepository.save(gin);
        return convertToDTO(saved);
    }

    public List<GoodsIssueNoteDTO> getAllGINs() {
        return ginRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoodsIssueNoteDTO getGINById(Long id) {
        GoodsIssueNote gin = ginRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GIN not found"));
        return convertToDTO(gin);
    }

    public GoodsIssueNoteDTO updateGIN(Long id, GoodsIssueNoteDTO ginDTO) {
        GoodsIssueNote gin = ginRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GIN not found"));

        // Only allow editing DRAFT GINs
        if (gin.getStatus() != GoodsIssueNote.GINStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT GINs can be edited");
        }

        // Reverse previous stock reductions
        for (GINLine existingLine : gin.getGinLines()) {
            Stock stock = stockRepository.findByItemId(existingLine.getItem().getId())
                    .orElseThrow(() -> new RuntimeException("Stock not found"));
            // Restore the stock that was previously reduced
            stock.setQuantityOnHand(stock.getQuantityOnHand() + existingLine.getQuantityIssued());
            stockRepository.save(stock);
        }

        // Update GIN fields
        gin.setIssueDate(ginDTO.getIssueDate() != null ? ginDTO.getIssueDate() : LocalDate.now());
        gin.setRemarks(ginDTO.getRemarks());

        // Clear existing lines
        gin.getGinLines().clear();

        // Add new lines and reduce stock
        for (GINLineDTO lineDTO : ginDTO.getGinLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in GIN");
            }

            Stock stock = stockRepository.findByItemId(item.getId())
                    .orElseThrow(() -> new RuntimeException("Stock not found"));

            if (stock.getQuantityOnHand() < lineDTO.getQuantityIssued()) {
                throw new RuntimeException("Insufficient stock for item: " + item.getName());
            }

            GINLine line = new GINLine();
            line.setGin(gin);
            line.setItem(item);
            line.setQuantityOrdered(lineDTO.getQuantityOrdered());
            line.setQuantityIssued(lineDTO.getQuantityIssued());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantityIssued())));
            gin.getGinLines().add(line);

            // Reduce stock
            stock.setQuantityOnHand(stock.getQuantityOnHand() - lineDTO.getQuantityIssued());
            stockRepository.save(stock);
        }

        GoodsIssueNote saved = ginRepository.save(gin);
        return convertToDTO(saved);
    }

    public GoodsIssueNoteDTO updateGINStatus(Long id, String status) {
        GoodsIssueNote gin = ginRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GIN not found"));
        
        try {
            GoodsIssueNote.GINStatus newStatus = GoodsIssueNote.GINStatus.valueOf(status);
            gin.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Valid statuses are: DRAFT, CONFIRMED, CANCELLED");
        }
        
        GoodsIssueNote saved = ginRepository.save(gin);
        return convertToDTO(saved);
    }

    private String generateGINNumber() {
        String prefix = "GIN";
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = ginRepository.count();
        return String.format("%s-%s-%05d", prefix, dateStr, count + 1);
    }

    private GoodsIssueNoteDTO convertToDTO(GoodsIssueNote gin) {
        GoodsIssueNoteDTO dto = new GoodsIssueNoteDTO();
        dto.setId(gin.getId());
        dto.setGinNumber(gin.getGinNumber());
        dto.setSalesOrderId(gin.getSalesOrder().getId());
        dto.setSoNumber(gin.getSalesOrder().getSoNumber());
        dto.setIssueDate(gin.getIssueDate());
        dto.setRemarks(gin.getRemarks());
        dto.setIssuedById(gin.getIssuedBy().getId());
        dto.setIssuedByName(gin.getIssuedBy().getFullName());
        dto.setStatus(gin.getStatus().name());
        dto.setCreatedAt(gin.getCreatedAt());
        dto.setUpdatedAt(gin.getUpdatedAt());
        dto.setGinLines(gin.getGinLines().stream()
                .map(this::convertLineToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private GINLineDTO convertLineToDTO(GINLine line) {
        GINLineDTO dto = new GINLineDTO();
        dto.setId(line.getId());
        dto.setItemId(line.getItem().getId());
        dto.setItemName(line.getItem().getName());
        dto.setItemSku(line.getItem().getSku());
        dto.setQuantityOrdered(line.getQuantityOrdered());
        dto.setQuantityIssued(line.getQuantityIssued());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTotalPrice(line.getTotalPrice());
        return dto;
    }
}


