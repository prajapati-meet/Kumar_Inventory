package com.kumar.inventory.repository;

import com.kumar.inventory.entity.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Paginated search across modelDescription, model, modelName, and dmsCode.
     * Case-insensitive, space-insensitive, and special-character-insensitive partial match.
     */
    @Query("""
            SELECT i FROM InventoryItem i
            WHERE (:keyword IS NULL OR :keyword = '' OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelDescription), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelName), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.model), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.dmsCode), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%'))
            """)
    Page<InventoryItem> search(
            @Param("keyword") String keyword,
            @Param("normalizedKeyword") String normalizedKeyword,
            Pageable pageable);

    /**
     * Same search but returns all results (used for Excel export, no pagination).
     */
    @Query("""
            SELECT i FROM InventoryItem i
            WHERE (:keyword IS NULL OR :keyword = '' OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelDescription), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelName), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.model), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.dmsCode), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%'))
            """)
    List<InventoryItem> searchAll(
            @Param("keyword") String keyword,
            @Param("normalizedKeyword") String normalizedKeyword);

    /**
     * Search but returns only one row per unique model.
     */
    @Query("""
            SELECT i FROM InventoryItem i
            WHERE i.id IN (SELECT MIN(i2.id) FROM InventoryItem i2 GROUP BY i2.model)
            AND (:keyword IS NULL OR :keyword = '' OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelDescription), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.modelName), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.model), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%') OR
                   REPLACE(REPLACE(REPLACE(LOWER(i.dmsCode), ' ', ''), '-', ''), '_', '') LIKE CONCAT('%', :normalizedKeyword, '%'))
            """)
    Page<InventoryItem> searchUniqueModels(
            @Param("keyword") String keyword,
            @Param("normalizedKeyword") String normalizedKeyword,
            Pageable pageable);
}
