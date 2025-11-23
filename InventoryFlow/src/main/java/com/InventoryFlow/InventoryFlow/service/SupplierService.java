package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.SupplierDTO;
import com.InventoryFlow.InventoryFlow.entity.Supplier;
import com.InventoryFlow.InventoryFlow.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        Supplier supplier = new Supplier();
        supplier.setName(supplierDTO.getName());
        supplier.setAddress(supplierDTO.getAddress());
        supplier.setPhone(supplierDTO.getPhone());
        supplier.setEmail(supplierDTO.getEmail());
        supplier.setActive(supplierDTO.getActive() != null && supplierDTO.getActive() == 1 ? 1 : 0);

        Supplier saved = supplierRepository.save(supplier);
        return convertToDTO(saved);
    }

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByActive(1).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return convertToDTO(supplier);
    }

    public SupplierDTO updateSupplier(Long id, SupplierDTO supplierDTO) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        supplier.setName(supplierDTO.getName());
        supplier.setAddress(supplierDTO.getAddress());
        supplier.setPhone(supplierDTO.getPhone());
        supplier.setEmail(supplierDTO.getEmail());
        supplier.setActive(supplierDTO.getActive() != null && supplierDTO.getActive() == 1 ? 1 : 0);

        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setAddress(supplier.getAddress());
        dto.setPhone(supplier.getPhone());
        dto.setEmail(supplier.getEmail());
        dto.setActive(supplier.getActive());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        return dto;
    }
}


