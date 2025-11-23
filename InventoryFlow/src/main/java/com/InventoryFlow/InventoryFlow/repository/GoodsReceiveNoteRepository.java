package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.GoodsReceiveNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoodsReceiveNoteRepository extends JpaRepository<GoodsReceiveNote, Long> {
    Optional<GoodsReceiveNote> findByGrnNumber(String grnNumber);
    boolean existsByGrnNumber(String grnNumber);
}


