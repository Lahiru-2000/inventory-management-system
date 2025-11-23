package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.InvoiceDTO;
import com.InventoryFlow.InventoryFlow.entity.Invoice;
import com.InventoryFlow.InventoryFlow.entity.SalesOrder;
import com.InventoryFlow.InventoryFlow.entity.User;
import com.InventoryFlow.InventoryFlow.repository.InvoiceRepository;
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
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private SalesOrderRepository soRepository;

    @Autowired
    private UserRepository userRepository;

    public InvoiceDTO createInvoiceFromSO(Long soId, InvoiceDTO invoiceDTO) {
        SalesOrder so = soRepository.findById(soId)
                .orElseThrow(() -> new RuntimeException("Sales Order not found"));

        if (invoiceRepository.findBySalesOrderId(soId).isPresent()) {
            throw new RuntimeException("Invoice already exists for this Sales Order");
        }

        User createdBy = userRepository.findById(invoiceDTO.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setSalesOrder(so);
        invoice.setInvoiceDate(invoiceDTO.getInvoiceDate() != null ? invoiceDTO.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(invoiceDTO.getDueDate());
        invoice.setSubtotal(so.getTotalAmount().add(so.getDiscount()).subtract(so.getTax()));
        invoice.setDiscount(so.getDiscount());
        invoice.setTax(so.getTax());
        invoice.setTotalAmount(so.getTotalAmount());
        invoice.setPaymentStatus(Invoice.PaymentStatus.valueOf(invoiceDTO.getPaymentStatus()));
        invoice.setCreatedBy(createdBy);

        // Update SO status to INVOICED
        so.setStatus(SalesOrder.SOStatus.INVOICED);
        soRepository.save(so);

        Invoice saved = invoiceRepository.save(invoice);
        return convertToDTO(saved);
    }

    public InvoiceDTO updatePaymentStatus(Long id, String paymentStatus) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setPaymentStatus(Invoice.PaymentStatus.valueOf(paymentStatus));
        Invoice saved = invoiceRepository.save(invoice);
        return convertToDTO(saved);
    }

    public List<InvoiceDTO> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return convertToDTO(invoice);
    }

    private String generateInvoiceNumber() {
        String prefix = "INV";
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count();
        return String.format("%s-%s-%05d", prefix, dateStr, count + 1);
    }

    private InvoiceDTO convertToDTO(Invoice invoice) {
        InvoiceDTO dto = new InvoiceDTO();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setSalesOrderId(invoice.getSalesOrder().getId());
        dto.setSoNumber(invoice.getSalesOrder().getSoNumber());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setDiscount(invoice.getDiscount());
        dto.setTax(invoice.getTax());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaymentStatus(invoice.getPaymentStatus().name());
        dto.setCreatedById(invoice.getCreatedBy().getId());
        dto.setCreatedByName(invoice.getCreatedBy().getFullName());
        dto.setCreatedAt(invoice.getCreatedAt());
        return dto;
    }
}


