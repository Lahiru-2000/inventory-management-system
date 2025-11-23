package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.SalesOrderDTO;
import com.InventoryFlow.InventoryFlow.dto.SalesOrderLineDTO;
import com.InventoryFlow.InventoryFlow.entity.Item;
import com.InventoryFlow.InventoryFlow.entity.SalesOrder;
import com.InventoryFlow.InventoryFlow.entity.SalesOrderLine;
import com.InventoryFlow.InventoryFlow.entity.User;
import com.InventoryFlow.InventoryFlow.repository.ItemRepository;
import com.InventoryFlow.InventoryFlow.repository.SalesOrderRepository;
import com.InventoryFlow.InventoryFlow.repository.UserRepository;
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
public class SalesOrderService {

    @Autowired
    private SalesOrderRepository soRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    public SalesOrderDTO createSalesOrder(SalesOrderDTO soDTO) {
        User createdBy = userRepository.findById(soDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        SalesOrder so = new SalesOrder();
        so.setSoNumber(generateSONumber());
        so.setOrderDate(soDTO.getOrderDate() != null ? soDTO.getOrderDate() : LocalDate.now());
        so.setDeliveryDate(soDTO.getDeliveryDate());
        so.setCustomerName(soDTO.getCustomerName());
        so.setCustomerAddress(soDTO.getCustomerAddress());
        so.setCustomerPhone(soDTO.getCustomerPhone());
        so.setStatus(SalesOrder.SOStatus.valueOf(soDTO.getStatus()));
        so.setDiscount(soDTO.getDiscount() != null ? soDTO.getDiscount() : BigDecimal.ZERO);
        so.setTax(soDTO.getTax() != null ? soDTO.getTax() : BigDecimal.ZERO);
        so.setRemarks(soDTO.getRemarks());
        so.setCreatedBy(createdBy);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SalesOrderLineDTO lineDTO : soDTO.getOrderLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in Sales Orders");
            }

            SalesOrderLine line = new SalesOrderLine();
            line.setSalesOrder(so);
            line.setItem(item);
            line.setQuantity(lineDTO.getQuantity());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantity())));
            so.getOrderLines().add(line);
            subtotal = subtotal.add(line.getTotalPrice());
        }

        BigDecimal total = subtotal.subtract(so.getDiscount()).add(so.getTax());
        so.setTotalAmount(total);

        SalesOrder saved = soRepository.save(so);
        return convertToDTO(saved);
    }

    public List<SalesOrderDTO> getAllSalesOrders() {
        return soRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SalesOrderDTO getSalesOrderById(Long id) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));
        return convertToDTO(so);
    }

    public SalesOrderDTO updateSalesOrderStatus(Long id, String status) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));
        
        try {
            SalesOrder.SOStatus newStatus = SalesOrder.SOStatus.valueOf(status);
            so.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Valid statuses are: DRAFT, CONFIRMED, INVOICED, CANCELLED");
        }
        
        SalesOrder saved = soRepository.save(so);
        return convertToDTO(saved);
    }

    public SalesOrderDTO updateSalesOrder(Long id, SalesOrderDTO soDTO) {
        SalesOrder so = soRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        // Only allow editing DRAFT orders
        if (so.getStatus() != SalesOrder.SOStatus.DRAFT) {
            throw new RuntimeException("Only DRAFT sales orders can be edited");
        }

        so.setOrderDate(soDTO.getOrderDate() != null ? soDTO.getOrderDate() : LocalDate.now());
        so.setDeliveryDate(soDTO.getDeliveryDate());
        so.setCustomerName(soDTO.getCustomerName());
        so.setCustomerAddress(soDTO.getCustomerAddress());
        so.setCustomerPhone(soDTO.getCustomerPhone());
        so.setStatus(SalesOrder.SOStatus.valueOf(soDTO.getStatus()));
        so.setDiscount(soDTO.getDiscount() != null ? soDTO.getDiscount() : BigDecimal.ZERO);
        so.setTax(soDTO.getTax() != null ? soDTO.getTax() : BigDecimal.ZERO);
        so.setRemarks(soDTO.getRemarks());

        // Clear existing order lines
        so.getOrderLines().clear();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SalesOrderLineDTO lineDTO : soDTO.getOrderLines()) {
            Item item = itemRepository.findById(lineDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            // Validate that item is active
            if (item.getActive() == null || item.getActive() != 1) {
                throw new RuntimeException("Item '" + item.getName() + "' is inactive and cannot be used in Sales Orders");
            }

            SalesOrderLine line = new SalesOrderLine();
            line.setSalesOrder(so);
            line.setItem(item);
            line.setQuantity(lineDTO.getQuantity());
            line.setUnitPrice(lineDTO.getUnitPrice());
            line.setTotalPrice(lineDTO.getUnitPrice().multiply(BigDecimal.valueOf(lineDTO.getQuantity())));
            so.getOrderLines().add(line);
            subtotal = subtotal.add(line.getTotalPrice());
        }

        BigDecimal total = subtotal.subtract(so.getDiscount()).add(so.getTax());
        so.setTotalAmount(total);

        SalesOrder saved = soRepository.save(so);
        return convertToDTO(saved);
    }

    private String generateSONumber() {
        String prefix = "SO";
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = soRepository.count();
        return String.format("%s-%s-%05d", prefix, dateStr, count + 1);
    }

    private SalesOrderDTO convertToDTO(SalesOrder so) {
        SalesOrderDTO dto = new SalesOrderDTO();
        dto.setId(so.getId());
        dto.setSoNumber(so.getSoNumber());
        dto.setOrderDate(so.getOrderDate());
        dto.setDeliveryDate(so.getDeliveryDate());
        dto.setCustomerName(so.getCustomerName());
        dto.setCustomerAddress(so.getCustomerAddress());
        dto.setCustomerPhone(so.getCustomerPhone());
        dto.setStatus(so.getStatus().name());
        dto.setDiscount(so.getDiscount());
        dto.setTax(so.getTax());
        dto.setTotalAmount(so.getTotalAmount());
        dto.setRemarks(so.getRemarks());
        dto.setCreatedById(so.getCreatedBy().getId());
        dto.setCreatedByName(so.getCreatedBy().getFullName());
        dto.setCreatedAt(so.getCreatedAt());
        dto.setOrderLines(so.getOrderLines().stream()
                .map(this::convertLineToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private SalesOrderLineDTO convertLineToDTO(SalesOrderLine line) {
        SalesOrderLineDTO dto = new SalesOrderLineDTO();
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


