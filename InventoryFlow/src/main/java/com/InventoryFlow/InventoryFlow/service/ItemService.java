package com.InventoryFlow.InventoryFlow.service;

import com.InventoryFlow.InventoryFlow.dto.ItemDTO;
import com.InventoryFlow.InventoryFlow.entity.Category;
import com.InventoryFlow.InventoryFlow.entity.Item;
import com.InventoryFlow.InventoryFlow.entity.Stock;
import com.InventoryFlow.InventoryFlow.repository.CategoryRepository;
import com.InventoryFlow.InventoryFlow.repository.ItemRepository;
import com.InventoryFlow.InventoryFlow.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StockRepository stockRepository;

    public ItemDTO createItem(ItemDTO itemDTO) {
        if (itemRepository.existsBySku(itemDTO.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        Category category = categoryRepository.findById(itemDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Validate that category is active
        if (category.getActive() == null || category.getActive() != 1) {
            throw new RuntimeException("Category '" + category.getName() + "' is inactive and cannot be used");
        }

        Item item = new Item();
        item.setName(itemDTO.getName());
        item.setSku(itemDTO.getSku());
        item.setCategory(category);
        item.setUnit(itemDTO.getUnit());
        item.setCostPrice(itemDTO.getCostPrice());
        item.setSellingPrice(itemDTO.getSellingPrice());
        item.setReorderLevel(itemDTO.getReorderLevel());
        item.setActive(itemDTO.getActive() != null && itemDTO.getActive() == 1 ? 1 : 0);

        Item saved = itemRepository.save(item);

        // Create stock entry
        Stock stock = new Stock();
        stock.setItem(saved);
        stock.setQuantityOnHand(0);
        stockRepository.save(stock);

        return convertToDTO(saved);
    }

    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getActiveItems() {
        return itemRepository.findByActive(1).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getLowStockItems() {
        return itemRepository.findLowStockItems().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ItemDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return convertToDTO(item);
    }

    public ItemDTO updateItem(Long id, ItemDTO itemDTO) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getSku().equals(itemDTO.getSku()) && 
            itemRepository.existsBySku(itemDTO.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        Category category = categoryRepository.findById(itemDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Validate that category is active
        if (category.getActive() == null || category.getActive() != 1) {
            throw new RuntimeException("Category '" + category.getName() + "' is inactive and cannot be used");
        }

        item.setName(itemDTO.getName());
        item.setSku(itemDTO.getSku());
        item.setCategory(category);
        item.setUnit(itemDTO.getUnit());
        item.setCostPrice(itemDTO.getCostPrice());
        item.setSellingPrice(itemDTO.getSellingPrice());
        item.setReorderLevel(itemDTO.getReorderLevel());
        item.setActive(itemDTO.getActive() != null && itemDTO.getActive() == 1 ? 1 : 0);

        Item updated = itemRepository.save(item);
        return convertToDTO(updated);
    }

    private ItemDTO convertToDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setSku(item.getSku());
        dto.setCategoryId(item.getCategory().getId());
        dto.setCategoryName(item.getCategory().getName());
        dto.setUnit(item.getUnit());
        dto.setCostPrice(item.getCostPrice());
        dto.setSellingPrice(item.getSellingPrice());
        dto.setReorderLevel(item.getReorderLevel());
        dto.setActive(item.getActive());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }
}


