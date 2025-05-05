package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getCurrentUserOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.findUserOrders(authentication);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", order));
    }
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderDTO>> createOrder(@RequestBody OrderDTO orderDTO, Authentication authentication) {
        OrderDTO createdOrder = orderService.createOrder(orderDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", createdOrder));
    }
    
    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> cancelOrder(@PathVariable Long id, Authentication authentication) {
        orderService.cancelOrder(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", null));
    }
    
    // Admin/Seller endpoints for managing orders
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getAllOrders() {
        List<OrderDTO> orders = orderService.findAllOrders();
        return ResponseEntity.ok(ApiResponse.success("All orders retrieved successfully", orders));
    }
    
    @GetMapping("/seller/all")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getSellerOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.findSellerOrders(authentication);
        return ResponseEntity.ok(ApiResponse.success("Seller orders retrieved successfully", orders));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'PLATFORM_ADMIN')")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            Authentication authentication) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updatedOrder));
    }

    @PostMapping("/{id}/pay")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<OrderDTO>> payOrder(
        @PathVariable Long id, Authentication auth) {
    OrderDTO paidOrder = orderService.updateOrderStatus(id, "PAID", auth);
    return ResponseEntity.ok(ApiResponse.success("Payment processed", paidOrder));
}

} 