package com.example.backend.service;

public interface PaymentService {
    String createPaymentIntent(Long orderId);
    void processRefund(Long orderId);
}
