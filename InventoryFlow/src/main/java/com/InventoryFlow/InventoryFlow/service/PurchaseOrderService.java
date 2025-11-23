package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.PurchaseOrderDTO;
import com.InventoryFlow.InventoryFlow.dto.PurchaseOrderLineDTO;
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
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    public PurchaseOrderDTO createPO(PurchaseOrderDTO poDTO) {
        Supplier supplier = supplierRepository.findById(poDTO.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Validate that supplier is active
        if (supplier.getActive() == null || supplier.getActive() != 1) {
            throw new RuntimeException("Supplier '" + supplier.getName() + "' is inactive and cannot be used in Purchase Orders");
        }

        User createdBy = userRepository.findById(poDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePONumber());
        po.setSupplier(supplier);
        po.setOrderDate(poDTO.getOrderDate() != null ? poDTO.getOrderDate() : LocalDate.now());
        po.setDueDate(poDTO.getDueDate());
        po.setStatus(PurchaseOrder.POStatus.valueOf(poDTO.getStatus()));
        po.setRemarks(poDTO.getRemarks());
        po.setCreatedBy(createdBy);

        for (PurchaseOrderLineDTO lineDTO : poDTO.getOrderLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + lineDTO.getItemId()));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in Purchase Orders");
            }

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setItem(item);
            line.setQuantity(lineDTO.getQuantity());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantity())));
            po.getOrderLines().add(line);
        }

        PurchaseOrder saved = poRepository.save(po);
        return convertToDTO(saved);
    }

    public PurchaseOrderDTO approvePO(Long id, Long approvedById) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        // Allow approval from both DRAFT and PENDING_APPROVAL status
        if (po.getStatus() != PurchaseOrder.POStatus.PENDING_APPROVAL && 
            po.getStatus() != PurchaseOrder.POStatus.DRAFT) {
            throw new RuntimeException("PO must be in DRAFT or PENDING_APPROVAL status to approve");
        }

        User approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        po.setStatus(PurchaseOrder.POStatus.APPROVED);
        po.setApprovedBy(approvedBy);

        PurchaseOrder saved = poRepository.save(po);
        return convertToDTO(saved);
    }

    public PurchaseOrderDTO rejectPO(Long id, Long rejectedById) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        // Allow rejection from both DRAFT and PENDING_APPROVAL status
        if (po.getStatus() != PurchaseOrder.POStatus.PENDING_APPROVAL && 
            po.getStatus() != PurchaseOrder.POStatus.DRAFT) {
            throw new RuntimeException("PO must be in DRAFT or PENDING_APPROVAL status to reject");
        }

        User rejectedBy = userRepository.findById(rejectedById)
                .orElseThrow(() -> new RuntimeException("User not found"));

        po.setStatus(PurchaseOrder.POStatus.REJECTED);
        po.setApprovedBy(rejectedBy); // Using approvedBy field to track who rejected

        PurchaseOrder saved = poRepository.save(po);
        return convertToDTO(saved);
    }

    public PurchaseOrderDTO updatePO(Long id, PurchaseOrderDTO poDTO) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found"));

        // Only allow updating DRAFT or PENDING_APPROVAL POs
        if (po.getStatus() != PurchaseOrder.POStatus.DRAFT && 
            po.getStatus() != PurchaseOrder.POStatus.PENDING_APPROVAL) {
            throw new RuntimeException("PO must be in DRAFT or PENDING_APPROVAL status to update");
        }

        Supplier supplier = supplierRepository.findById(poDTO.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        // Validate that supplier is active
        if (supplier.getActive() == null || supplier.getActive() != 1) {
            throw new RuntimeException("Supplier '" + supplier.getName() + "' is inactive and cannot be used in Purchase Orders");
        }

        // Clear existing lines
        po.getOrderLines().clear();

        // Update PO fields
        po.setSupplier(supplier);
        po.setOrderDate(poDTO.getOrderDate() != null ? poDTO.getOrderDate() : LocalDate.now());
        po.setDueDate(poDTO.getDueDate());
        po.setRemarks(poDTO.getRemarks());

        // Add new lines
        for (PurchaseOrderLineDTO lineDTO : poDTO.getOrderLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + lineDTO.getItemId()));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in Purchase Orders");
            }

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setPurchaseOrder(po);
            line.setItem(item);
            line.setQuantity(lineDTO.getQuantity());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantity())));
            po.getOrderLines().add(line);
        }

        PurchaseOrder saved = poRepository.save(po);
        return convertToDTO(saved);
    }

    public List<PurchaseOrderDTO> getAllPOs() {
        return poRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PurchaseOrderDTO getPOById(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found"));
        return convertToDTO(po);
    }

    private String generatePONumber() {
        String prefix = "PO";
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = poRepository.count();
        return String.format("%s-%s-%05d", prefix, dateStr, count + 1);
    }

    private PurchaseOrderDTO convertToDTO(PurchaseOrder po) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setOrderDate(po.getOrderDate());
        dto.setDueDate(po.getDueDate());
        dto.setStatus(po.getStatus().name());
        dto.setRemarks(po.getRemarks());
        dto.setCreatedById(po.getCreatedBy().getId());
        dto.setCreatedByName(po.getCreatedBy().getFullName());
        if (po.getApprovedBy() != null) {
            dto.setApprovedById(po.getApprovedBy().getId());
            dto.setApprovedByName(po.getApprovedBy().getFullName());
        }
        dto.setCreatedAt(po.getCreatedAt());
        dto.setOrderLines(po.getOrderLines().stream()
                .map(this::convertLineToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private PurchaseOrderLineDTO convertLineToDTO(PurchaseOrderLine line) {
        PurchaseOrderLineDTO dto = new PurchaseOrderLineDTO();
        dto.setId(line.getId());
        dto.setItemId(line.getItem().getId());
        dto.setItemName(line.getItem().getName());
        dto.setItemSku(line.getItem().getSku());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTotalPrice(line.getTotalPrice());
        return dto;
    }
}


