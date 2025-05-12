package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fix-db")
public class FixDbController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/drop-store-constraint")
    public ResponseEntity<String> dropStoreConstraint() {
        StringBuilder result = new StringBuilder();
        
        try {
            // Try to drop the unique constraint by different means
            result.append("Attempting multiple methods to drop the constraint...\n");
            
            // Method 1: Direct index drop
            try {
                jdbcTemplate.execute("ALTER TABLE stores DROP INDEX UK2yl4gisselw9ehmnupuqhl3ao");
                result.append("Method 1 successful: Dropped index UK2yl4gisselw9ehmnupuqhl3ao\n");
            } catch (Exception e) {
                result.append("Method 1 failed: " + e.getMessage() + "\n");
            }
            
            // Method 2: Show indexes and try to find constraint name
            try {
                List<Map<String, Object>> indexes = jdbcTemplate.queryForList(
                    "SHOW INDEXES FROM stores WHERE Column_name = 'seller_id'"
                );
                result.append("Found indexes: " + indexes.toString() + "\n");
                
                for (Map<String, Object> index : indexes) {
                    String keyName = index.get("Key_name").toString();
                    if (!keyName.equals("PRIMARY")) {
                        try {
                            jdbcTemplate.execute("ALTER TABLE stores DROP INDEX `" + keyName + "`");
                            result.append("Dropped index: " + keyName + "\n");
                        } catch (Exception e) {
                            result.append("Failed to drop index " + keyName + ": " + e.getMessage() + "\n");
                        }
                    }
                }
            } catch (Exception e) {
                result.append("Method 2 failed: " + e.getMessage() + "\n");
            }
            
            // Method 3: Try to modify the column to remove uniqueness
            try {
                jdbcTemplate.execute("ALTER TABLE stores MODIFY COLUMN seller_id BIGINT NOT NULL");
                result.append("Method 3 successful: Modified seller_id column\n");
            } catch (Exception e) {
                result.append("Method 3 failed: " + e.getMessage() + "\n");
            }
            
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Overall error: " + e.getMessage());
        }
    }
    
    @GetMapping("/recreate-stores-table")
    public ResponseEntity<String> recreateStoresTable() {
        StringBuilder result = new StringBuilder();
        
        try {
            // First backup existing data
            List<Map<String, Object>> stores = jdbcTemplate.queryForList("SELECT * FROM stores");
            result.append("Backed up " + stores.size() + " stores\n");
            
            // Rename the original table
            jdbcTemplate.execute("RENAME TABLE stores TO stores_old");
            result.append("Renamed stores table to stores_old\n");
            
            // Create new table without the unique constraint
            jdbcTemplate.execute("CREATE TABLE stores (" +
                "store_id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "seller_id BIGINT NOT NULL, " +
                "store_name VARCHAR(255), " +
                "description VARCHAR(1000), " +
                "created_at DATETIME, " +
                "FOREIGN KEY (seller_id) REFERENCES users(user_id)" +
                ")");
            result.append("Created new stores table without unique constraint\n");
            
            // Restore data - skip if there's a duplicate to ensure it doesn't fail
            if (!stores.isEmpty()) {
                for (Map<String, Object> store : stores) {
                    try {
                        jdbcTemplate.update(
                            "INSERT INTO stores (store_id, seller_id, store_name, description, created_at) VALUES (?, ?, ?, ?, ?)",
                            store.get("store_id"),
                            store.get("seller_id"),
                            store.get("store_name"),
                            store.get("description"),
                            store.get("created_at")
                        );
                    } catch (Exception e) {
                        result.append("Warning: Couldn't restore store " + store.get("store_id") + ": " + e.getMessage() + "\n");
                    }
                }
            }
            
            result.append("Table recreated successfully\n");
            return ResponseEntity.ok(result.toString());
        } catch (Exception e) {
            return ResponseEntity.ok("Error recreating stores table: " + e.getMessage());
        }
    }
} 