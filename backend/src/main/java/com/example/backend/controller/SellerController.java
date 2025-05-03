package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.dto.ShipmentDTO;
import com.example.backend.service.OrderService;
import com.example.backend.service.ProductService;
import com.example.backend.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasRole('SELLER')")
public class SellerController {
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ShipmentService shipmentService;
    
    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getSellerOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.findSellerOrders(authentication);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            Authentication authentication) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updatedOrder));
    }
    
    // Product Management
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getSellerProducts(Authentication authentication) {
        List<ProductDTO> products = productService.findSellerProducts(authentication);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO createdProduct = productService.createSellerProduct(productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", createdProduct));
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO updatedProduct = productService.updateSellerProduct(id, productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updatedProduct));
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        productService.deleteSellerProduct(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
    
    // Shipment Management
    @GetMapping("/shipments")
    public ResponseEntity<ApiResponse<List<ShipmentDTO>>> getSellerShipments(Authentication authentication) {
        List<ShipmentDTO> shipments = shipmentService.findSellerShipments(authentication);
        return ResponseEntity.ok(ApiResponse.success(shipments));
    }
    
    @PutMapping("/shipments/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentDTO>> updateShipmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication) {
        String status = statusUpdate.get("status");
        String trackingNumber = statusUpdate.get("trackingNumber");
        
        ShipmentDTO updatedShipment = shipmentService.updateShipmentStatus(id, status, trackingNumber, authentication);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", updatedShipment));
    }
    
    // Sales and Transaction Reports
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerTransactions(
            @RequestParam(required = false) String period,
            Authentication authentication) {
        Map<String, Object> transactions = orderService.getSellerTransactions(period, authentication);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
} 