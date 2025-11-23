package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByItemId(Long itemId);
    
    @Query("SELECT SUM(s.quantityOnHand * i.costPrice) FROM Stock s JOIN s.item i")
    BigDecimal getTotalStockValue();
}


