package com.kumar.inventory.repository;

import com.kumar.inventory.entity.UploadHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UploadHistoryRepository extends JpaRepository<UploadHistory, Long> {

    Page<UploadHistory> findAllByOrderByUploadedAtDesc(Pageable pageable);

    /** Fetches the most recent successful upload for the dashboard summary */
    Optional<UploadHistory> findTopByStatusOrderByUploadedAtDesc(String status);
}
