package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        Long orderId = ((Number) data.get("orderId")).longValue();
        String clientSecret = paymentService.createPaymentIntent(orderId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("clientSecret", clientSecret)));
    }

    @PutMapping("/refund")
    public ResponseEntity<ApiResponse<String>> refundPayment(@RequestParam Long orderId) {
        paymentService.processRefund(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", null));
    }
}
