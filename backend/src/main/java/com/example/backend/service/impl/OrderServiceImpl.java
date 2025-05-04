package com.example.backend.service.impl;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.entity.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.*;
import com.example.backend.service.CartService;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private CartService cartService;

    @Override
    public List<OrderDTO> findAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> findUserOrders(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return orderRepository.findByUserOrderByOrderDateDesc(currentUser).stream()
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> findSellerOrders(Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        
        // Get all orders with items from this seller's store
        return orderRepository.findAll().stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getStore().getSeller().getId().equals(seller.getId())))
                .map(this::mapOrderToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO findById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        return mapOrderToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Get user's cart
        Cart cart = cartRepository.findByUser(currentUser)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        
        // Create order
        Order order = new Order();
        order.setUser(currentUser);
        order.setShipmentStatus("PENDING");
        order = orderRepository.save(order);
        
        // Create order items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            
            // Check if product is still available
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Not enough stock available for product: " + product.getName());
            }
            
            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
            
            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItem.setStore(product.getStore());
            
            orderItem = orderItemRepository.save(orderItem);
            orderItems.add(orderItem);
            
            // Add to total
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        // Update order with total and items
        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);
        order.setShipmentStatus("CONFIRMED");
        order = orderRepository.save(order);
        
        // Clear cart after successful order
        cartService.clearCart();
        
        return mapOrderToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status, Authentication authentication) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // If user is a seller, verify they own the products in this order
        if (user.getRole() == Role.SELLER) {
            boolean isSellerOrder = order.getItems().stream()
                    .anyMatch(item -> item.getStore().getSeller().getId().equals(user.getId()));
            
            if (!isSellerOrder) {
                throw new AccessDeniedException("You do not have permission to update this order");
            }
        } else if (user.getRole() != Role.PLATFORM_ADMIN) {
            // If not admin or seller, check if it's their own order
            if (!order.getUser().getId().equals(user.getId())) {
                throw new AccessDeniedException("You do not have permission to update this order");
            }
            
            // Regular users can only cancel their orders
            if (!status.equals("CANCELLED")) {
                throw new AccessDeniedException("You can only cancel your orders");
            }
        }
        
        // Validate status
        List<String> validStatuses = List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid status: " + status);
        }
        
        order.setShipmentStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        return mapOrderToDTO(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long id, Authentication authentication) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Check if it's the user's own order
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("You do not have permission to cancel this order");
        }
        
        // Only pending or confirmed orders can be cancelled
        if (!order.getShipmentStatus().equals("PENDING") && !order.getShipmentStatus().equals("CONFIRMED")) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getShipmentStatus());
        }
        
        // Restore product stock
        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }
        
        // Update order status
        order.setShipmentStatus("CANCELLED");
        orderRepository.save(order);
    }
    
    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        
        // Delete order items first to avoid FK constraint issues
        orderItemRepository.deleteAll(order.getItems());
        
        // Delete the order
        orderRepository.delete(order);
    }
    
    @Override
    public Map<String, Object> getSellerTransactions(String period, Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        
        // Define start date based on period
        LocalDate startDate;
        LocalDate endDate = LocalDate.now();
        
        switch (period.toLowerCase()) {
            case "week":
                // Start from last Monday
                startDate = endDate.with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
                break;
            case "month":
                // Start from 1st of current month
                startDate = endDate.withDayOfMonth(1);
                break;
            case "year":
                // Start from January 1st of current year
                startDate = endDate.withDayOfMonth(1).withMonth(1);
                break;
            default:
                // Default to last 30 days
                startDate = endDate.minusDays(30);
        }
        
        // Convert to LocalDateTime for comparison
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay(); // Include today
        
        // Find orders within date range with items from seller's stores
        List<Order> orders = orderRepository.findByOrderDateBetween(startDateTime, endDateTime)
                .stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getStore().getSeller().getId().equals(seller.getId())))
                .collect(Collectors.toList());
        
        // Calculate statistics
        BigDecimal totalSales = BigDecimal.ZERO;
        int totalOrderCount = orders.size();
        int totalProductCount = 0;
        
        Map<String, BigDecimal> productSales = new HashMap<>();
        
        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                // Only count items from this seller's stores
                if (item.getStore().getSeller().getId().equals(seller.getId())) {
                    BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    totalSales = totalSales.add(itemTotal);
                    totalProductCount += item.getQuantity();
                    
                    // Track sales by product
                    String productName = item.getProduct().getName();
                    productSales.put(productName, 
                            productSales.getOrDefault(productName, BigDecimal.ZERO).add(itemTotal));
                }
            }
        }
        
        // Prepare results
        Map<String, Object> result = new HashMap<>();
        result.put("totalSales", totalSales);
        result.put("totalOrders", totalOrderCount);
        result.put("totalProducts", totalProductCount);
        result.put("productSales", productSales);
        result.put("period", period);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        
        return result;
    }
    
    private OrderDTO mapOrderToDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setStatus(order.getShipmentStatus());
        orderDTO.setUserEmail(order.getUser().getEmail());
        
        // Map order items
        List<OrderItemDTO> orderItemDTOs = order.getItems().stream()
                .map(this::mapOrderItemToDTO)
                .collect(Collectors.toList());
        
        orderDTO.setItems(orderItemDTOs);
        
        return orderDTO;
    }
    
    private OrderItemDTO mapOrderItemToDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProduct().getName());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        
        if (orderItem.getStore() != null) {
            dto.setStoreId(orderItem.getStore().getId());
            dto.setStoreName(orderItem.getStore().getStoreName());
        }
        
        // Get primary image URL if available
        productImageRepository.findByProductAndPrimaryImageIsTrue(orderItem.getProduct())
                .ifPresent(primaryImage -> dto.setImageUrl(primaryImage.getImageUrl()));
        
        return dto;
    }
} 