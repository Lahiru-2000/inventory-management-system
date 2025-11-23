package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findBySku(String sku);
    boolean existsBySku(String sku);
    List<Item> findByActive(Integer active);
    List<Item> findByCategoryId(Long categoryId);
    
    @Query("SELECT i FROM Item i JOIN Stock s ON i.id = s.item.id WHERE s.quantityOnHand <= i.reorderLevel AND i.active = 1")
    List<Item> findLowStockItems();
}


