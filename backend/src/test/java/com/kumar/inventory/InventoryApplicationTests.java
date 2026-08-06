package com.kumar.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class InventoryApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the Spring ApplicationContext loads without errors
    }
}
