package com.kumar.inventory.repository;

import com.kumar.inventory.entity.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, Long> {
    Optional<VehicleImage> findByVehicleKey(String vehicleKey);
}
