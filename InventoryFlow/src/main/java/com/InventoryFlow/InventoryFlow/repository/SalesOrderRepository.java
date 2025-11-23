package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    Optional<SalesOrder> findBySoNumber(String soNumber);
    boolean existsBySoNumber(String soNumber);
    List<SalesOrder> findByStatus(SalesOrder.SOStatus status);
    
    @Query("SELECT so FROM SalesOrder so WHERE so.orderDate BETWEEN :startDate AND :endDate")
    List<SalesOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(so.totalAmount) FROM SalesOrder so WHERE so.orderDate BETWEEN :startDate AND :endDate AND so.status = 'INVOICED'")
    java.math.BigDecimal getTotalSalesBetween(LocalDate startDate, LocalDate endDate);
}


