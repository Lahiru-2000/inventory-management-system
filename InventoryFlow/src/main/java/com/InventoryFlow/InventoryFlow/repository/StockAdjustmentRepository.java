package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findByItemId(Long itemId);
}


