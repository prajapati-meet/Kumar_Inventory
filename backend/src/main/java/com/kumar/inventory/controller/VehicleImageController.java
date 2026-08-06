package com.kumar.inventory.controller;

import com.kumar.inventory.entity.VehicleImage;
import com.kumar.inventory.repository.VehicleImageRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicle-images")
@RequiredArgsConstructor
@Tag(name = "Vehicle Images", description = "Endpoints for managing persistent vehicle images")
public class VehicleImageController {

    private final VehicleImageRepository vehicleImageRepository;

    @GetMapping("/{vehicleKey}")
    @Operation(summary = "Get Vehicle Image", description = "Fetches the persistent base64 image data for a vehicle key")
    public ResponseEntity<Map<String, String>> getImage(@PathVariable String vehicleKey) {
        String key = vehicleKey.trim().toLowerCase();
        String imageData = vehicleImageRepository.findByVehicleKey(key)
                .map(VehicleImage::getImageData)
                .orElse(null);

        Map<String, String> response = new HashMap<>();
        response.put("vehicleKey", key);
        response.put("imageData", imageData);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{vehicleKey}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload or Update Vehicle Image", description = "Saves or updates the base64 image data for a vehicle key")
    public ResponseEntity<Map<String, String>> uploadImage(
            @PathVariable String vehicleKey,
            @RequestBody Map<String, String> requestBody) {

        String key = vehicleKey.trim().toLowerCase();
        String imageData = requestBody.get("imageData");

        VehicleImage vehicleImage = vehicleImageRepository.findByVehicleKey(key)
                .orElseGet(() -> VehicleImage.builder().vehicleKey(key).build());

        vehicleImage.setImageData(imageData);
        vehicleImageRepository.save(vehicleImage);

        Map<String, String> response = new HashMap<>();
        response.put("vehicleKey", key);
        response.put("status", "SUCCESS");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{vehicleKey}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Vehicle Image", description = "Deletes the persistent image for a vehicle key")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable String vehicleKey) {
        String key = vehicleKey.trim().toLowerCase();
        vehicleImageRepository.findByVehicleKey(key).ifPresent(vehicleImageRepository::delete);

        Map<String, String> response = new HashMap<>();
        response.put("vehicleKey", key);
        response.put("status", "DELETED");
        return ResponseEntity.ok(response);
    }
}
