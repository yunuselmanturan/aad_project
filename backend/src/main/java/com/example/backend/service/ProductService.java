package com.example.backend.service;

import com.example.backend.dto.ProductDTO;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface ProductService {
    // Public operations (only active products)
    List<ProductDTO> findAll();
    ProductDTO findById(Long id);
    List<ProductDTO> findByCategory(Long categoryId);
    List<ProductDTO> findByStore(Long storeId);
    List<ProductDTO> search(String keyword);
    Map<String, Object> compareProducts(List<Long> productIds);
    
    // Seller operations
    List<ProductDTO> findSellerProducts(Authentication authentication);
    List<ProductDTO> findSellerArchivedProducts(Authentication authentication); // To get deleted/archived products
    ProductDTO createSellerProduct(ProductDTO productDTO, Authentication authentication);
    ProductDTO updateSellerProduct(Long id, ProductDTO productDTO, Authentication authentication);
    void softDeleteSellerProduct(Long id, Authentication authentication); // Soft delete
    void activateSellerProduct(Long id, Authentication authentication); // Activate a soft-deleted product
    
    /**
     * @deprecated Use {@link #softDeleteSellerProduct(Long, Authentication)} instead
     */
    @Deprecated
    void deleteSellerProduct(Long id, Authentication authentication);
    
    // Generic operations (used by admin)
    ProductDTO create(ProductDTO productDTO);
    ProductDTO update(Long id, ProductDTO productDTO);
    void softDelete(Long id); // Soft delete
    void activate(Long id); // Activate a soft-deleted product
    List<ProductDTO> findAllIncludingDeleted(); // Admin can see all products including deleted ones
    
    /**
     * @deprecated Use {@link #softDelete(Long)} instead
     */
    @Deprecated
    void delete(Long id);

    List<ProductDTO> searchProducts(String keyword);
    ProductDTO validateAndGetProductDTO(Long id);
    List<ProductDTO> findProductsByStore(Long storeId);
    
    List<Map<String, Object>> getAllReviews();
    void deleteReview(Long id);
} 