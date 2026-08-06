package com.kumar.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Records every Excel file upload: who uploaded, when, how many records, and which sheet.
 */
@Entity
@Table(name = "upload_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String sheetName;

    @Column(nullable = false)
    private int recordsImported;

    /** Username of the admin who performed the upload */
    @Column(nullable = false, length = 50)
    private String uploadedBy;

    @Column(length = 1000)
    private String notes;

    /** SUCCESS or FAILED */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 2000)
    private String errorMessage;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
}
