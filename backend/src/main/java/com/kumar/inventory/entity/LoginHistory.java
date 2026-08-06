package com.kumar.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit trail for every login attempt (success and failure).
 */
@Entity
@Table(name = "login_history",
        indexes = @Index(name = "idx_login_username", columnList = "username"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 20)
    private String role;

    /** SUCCESS or FAILED */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 500)
    private String failureReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime loginAt;
}
