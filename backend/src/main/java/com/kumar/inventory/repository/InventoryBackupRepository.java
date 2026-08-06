package com.kumar.inventory.repository;

import com.kumar.inventory.entity.InventoryBackup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryBackupRepository extends JpaRepository<InventoryBackup, Long> {

    List<InventoryBackup> findByBackupBatchIdOrderById(String backupBatchId);
}
