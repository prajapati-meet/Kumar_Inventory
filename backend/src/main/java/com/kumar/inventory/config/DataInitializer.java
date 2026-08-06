package com.kumar.inventory.config;

import com.kumar.inventory.entity.User;
import com.kumar.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with a default admin account on first startup.
 *
 * Default credentials:
 *   Username : admin
 *   Password : Admin@123
 *
 * ⚠ IMPORTANT: Change the admin password immediately after first login in production!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin if no admin exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .fullName("System Administrator")
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin account created. Username: 'admin', Password: 'Admin@123'");
            log.warn("⚠ CHANGE THE DEFAULT ADMIN PASSWORD IMMEDIATELY IN PRODUCTION!");
        }

        // Create a demo employee for testing
        if (!userRepository.existsByUsername("employee")) {
            User employee = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("Employee@123"))
                    .fullName("Demo Employee")
                    .role(User.Role.EMPLOYEE)
                    .enabled(true)
                    .build();
            userRepository.save(employee);
            log.info("Demo employee account created. Username: 'employee', Password: 'Employee@123'");
        }
    }
}
