package com.kumar.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity to persist vehicle images separately from inventory Excel sheets.
 * Mapped uniquely by vehicle name/model key.
 */
@Entity
@Table(name = "vehicle_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_key", nullable = false, unique = true, length = 255)
    private String vehicleKey;

    @Lob
    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData;
}
