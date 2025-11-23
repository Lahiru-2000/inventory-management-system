package com.InventoryFlow.InventoryFlow.repository;

import com.InventoryFlow.InventoryFlow.entity.GoodsIssueNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoodsIssueNoteRepository extends JpaRepository<GoodsIssueNote, Long> {
    Optional<GoodsIssueNote> findByGinNumber(String ginNumber);
    boolean existsByGinNumber(String ginNumber);
}


