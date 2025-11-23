package com.InventoryFlow.InventoryFlow.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_adjustments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer adjustedQuantity;

    @Column(nullable = false)
    private Integer newQuantity;

    private String reason;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "adjusted_by", nullable = false)
    private User adjustedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime adjustedAt;

    @PrePersist
    protected void onCreate() {
        adjustedAt = LocalDateTime.now();
    }
}


