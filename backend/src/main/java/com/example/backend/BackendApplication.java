package com.example.backend;

import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Store;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.StoreRepository;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                  CategoryRepository categoryRepository,
                                  StoreRepository storeRepository,
                                  ProductRepository productRepository) {
        return args -> {
            // Create admin user if it doesn't exist
            if (!userRepository.existsByEmail("admin@example.com")) {
                User adminUser = new User(
                        "Admin",
                        "User",
                        "admin@example.com",
                        passwordEncoder.encode("admin123"),
                        Role.PLATFORM_ADMIN
                );
                userRepository.save(adminUser);
                System.out.println("Admin user created");
            }

            // Create a sample seller
            if (!userRepository.existsByEmail("seller@example.com")) {
                User sellerUser = new User(
                        "Sample",
                        "Seller",
                        "seller@example.com",
                        passwordEncoder.encode("seller123"),
                        Role.SELLER
                );
                userRepository.save(sellerUser);
                System.out.println("Sample seller created");
            }

            // Create a sample customer
            if (!userRepository.existsByEmail("customer@example.com")) {
                User customerUser = new User(
                        "Sample",
                        "Customer",
                        "customer@example.com",
                        passwordEncoder.encode("customer123"),
                        Role.CUSTOMER
                );
                userRepository.save(customerUser);
                System.out.println("Sample customer created");
            }

            // Add default categories if none exist
            if (categoryRepository.count() == 0) {
                Category electronics = new Category();
                electronics.setName("Electronics");
                categoryRepository.save(electronics);

                Category books = new Category();
                books.setName("Books");
                categoryRepository.save(books);

                Category clothing = new Category();
                clothing.setName("Clothing");
                categoryRepository.save(clothing);

                System.out.println("Default categories created");
            }

            // Add some products for seller@example.com
            // Retrieve the seller
            User seller = userRepository.findByEmail("seller@example.com").orElse(null);
            if (seller != null) {
                // Create a default store if none exists for the seller
                Store store = storeRepository.findBySeller(seller).stream().findFirst().orElse(null);
                if (store == null) {
                    store = new Store();
                    store.setStoreName("Default Store");
                    store.setSeller(seller);
                    storeRepository.save(store);
                    System.out.println("Default store created for seller");
                }

                // Retrieve a category to assign to the product, e.g., "Electronics"
                Category electronicsCategory = categoryRepository.findByName("Electronics").stream().findFirst().orElse(null);
                if (electronicsCategory != null) {
                    // Create and save a product
                    Product product = new Product();
                    product.setName("Smartphone Model X");
                    product.setDescription("Latest smartphone with cutting-edge features.");
                    product.setPrice(new BigDecimal("499.99"));
                    product.setStockQuantity(50);
                    product.setSeller(seller);
                    product.setStore(store);
                    product.setCategory(electronicsCategory);
                    productRepository.save(product);
                    System.out.println("Default product created for seller");
                }
            }
        };
    }
}