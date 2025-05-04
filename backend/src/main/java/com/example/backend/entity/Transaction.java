package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* --------- İLİŞKİLER --------- */
    @OneToOne @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @OneToOne @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;

    @ManyToOne @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    /* --------- ÖZELLİKLER --------- */
    private BigDecimal amount;
    private String paymentStatus;
    private String shipmentStatus;
    private LocalDateTime createdAt;
}
