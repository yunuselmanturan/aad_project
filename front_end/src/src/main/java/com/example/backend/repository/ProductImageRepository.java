package com.example.backend.repository;

import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct(Product product);
    Optional<ProductImage> findByProductAndPrimaryImageIsTrue(Product product);
} 