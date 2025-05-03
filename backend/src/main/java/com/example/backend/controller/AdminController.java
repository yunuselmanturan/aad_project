package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.service.OrderService;
import com.example.backend.service.ProductService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.findDTOById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.update(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
    
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<UserDTO>> banUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        UserDTO bannedUser = userService.banUser(id, reason);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully", bannedUser));
    }
    
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<UserDTO>> unbanUser(@PathVariable Long id) {
        UserDTO unbannedUser = userService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully", unbannedUser));
    }
    
    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getAllOrders() {
        List<OrderDTO> orders = orderService.findAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<?>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }
    
    // Product Management
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        List<ProductDTO> products = productService.findAll();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
    
    // System Statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = userService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
} 