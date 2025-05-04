package com.example.backend.service.impl;

import com.example.backend.entity.Order;
import com.example.backend.entity.Payment;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.backend.entity.Transaction; // Ensure this is the correct package for the Transaction class

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public String createPaymentIntent(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Convert total amount to cents (assuming USD)
        long amount = order.getTotalAmount().multiply(new BigDecimal(100)).longValue();

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency("usd")
                    .build();
            PaymentIntent intent = PaymentIntent.create(params);

            // Save Payment record with PENDING status
            Payment payment = new Payment(order, order.getTotalAmount(), "STRIPE", intent.getId(), "PENDING");
            paymentRepository.save(payment);

            return intent.getClientSecret();
        } catch (StripeException e) {
            throw new RuntimeException("Stripe API error: " + e.getMessage());
        }
    }

    @Override
    public void processRefund(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrder(order)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(payment.getTransactionId())
                    .build();
            Refund refund = Refund.create(params);

            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
        } catch (StripeException e) {
            throw new RuntimeException("Stripe API error: " + e.getMessage());
        }
    }

    Transaction tx = Transaction.builder()
                .order(order)
                .payment(payment)
                .buyer(order.getBuyer())
                .seller(order.getOrderItems().get(0).getProduct().getSeller()) // çoklu ürünse ihtiyaca göre değiştirin
                .amount(payment.getAmount())
                .paymentStatus(payment.getStatus())
                .shipmentStatus(order.getShipmentStatus())
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);
}
