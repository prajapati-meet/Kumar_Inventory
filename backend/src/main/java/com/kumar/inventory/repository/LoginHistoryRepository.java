package com.kumar.inventory.repository;

import com.kumar.inventory.entity.LoginHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    Page<LoginHistory> findAllByOrderByLoginAtDesc(Pageable pageable);

    long countByStatus(String status);
}
