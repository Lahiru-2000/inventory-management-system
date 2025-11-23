package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.GoodsReceiveNoteDTO;
import com.InventoryFlow.InventoryFlow.dto.GRNLineDTO;
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
public class GoodsReceiveNoteService {

    @Autowired
    private GoodsReceiveNoteRepository grnRepository;

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockRepository stockRepository;

    public GoodsReceiveNoteDTO createGRNFromPO(Long poId, GoodsReceiveNoteDTO grnDTO) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        if (po.getStatus() != PurchaseOrder.POStatus.APPROVED) {
            throw new RuntimeException("PO must be APPROVED to create GRN");
        }

        User receivedBy = userRepository.findById(grnDTO.getReceivedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GoodsReceiveNote grn = new GoodsReceiveNote();
        grn.setGrnNumber(generateGRNNumber());
        grn.setPurchaseOrder(po);
        grn.setReceiveDate(grnDTO.getReceiveDate() != null ? grnDTO.getReceiveDate() : LocalDate.now());
        grn.setRemarks(grnDTO.getRemarks());
        grn.setReceivedBy(receivedBy);

        for (GRNLineDTO lineDTO : grnDTO.getGrnLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in GRN");
            }

            GRNLine line = new GRNLine();
            line.setGrn(grn);
            line.setItem(item);
            line.setQuantityOrdered(lineDTO.getQuantityOrdered());
            line.setQuantityReceived(lineDTO.getQuantityReceived());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantityReceived())));
            grn.getGrnLines().add(line);

            // Update stock
            Stock stock = stockRepository.findByItemId(item.getId())
                    .orElseThrow(() -> new RuntimeException("Stock not found for item"));
            stock.setQuantityOnHand(stock.getQuantityOnHand() + lineDTO.getQuantityReceived());
            stockRepository.save(stock);
        }

        GoodsReceiveNote saved = grnRepository.save(grn);
        return convertToDTO(saved);
    }

    public List<GoodsReceiveNoteDTO> getAllGRNs() {
        return grnRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GoodsReceiveNoteDTO getGRNById(Long id) {
        GoodsReceiveNote grn = grnRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GRN not found"));
        return convertToDTO(grn);
    }

    private String generateGRNNumber() {
        String prefix = "GRN";
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = grnRepository.count();
        return String.format("%s-%s-%05d", prefix, dateStr, count + 1);
    }

    private GoodsReceiveNoteDTO convertToDTO(GoodsReceiveNote grn) {
        GoodsReceiveNoteDTO dto = new GoodsReceiveNoteDTO();
        dto.setId(grn.getId());
        dto.setGrnNumber(grn.getGrnNumber());
        dto.setPurchaseOrderId(grn.getPurchaseOrder().getId());
        dto.setPoNumber(grn.getPurchaseOrder().getPoNumber());
        dto.setReceiveDate(grn.getReceiveDate());
        dto.setRemarks(grn.getRemarks());
        dto.setReceivedById(grn.getReceivedBy().getId());
        dto.setReceivedByName(grn.getReceivedBy().getFullName());
        dto.setCreatedAt(grn.getCreatedAt());
        dto.setGrnLines(grn.getGrnLines().stream()
                .map(this::convertLineToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private GRNLineDTO convertLineToDTO(GRNLine line) {
        GRNLineDTO dto = new GRNLineDTO();
        dto.setId(line.getId());
        dto.setItemId(line.getItem().getId());
        dto.setItemName(line.getItem().getName());
        dto.setItemSku(line.getItem().getSku());
        dto.setQuantityOrdered(line.getQuantityOrdered());
        dto.setQuantityReceived(line.getQuantityReceived());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTotalPrice(line.getTotalPrice());
        return dto;
    }
}


