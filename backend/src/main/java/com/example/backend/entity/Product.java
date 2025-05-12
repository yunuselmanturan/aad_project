package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "store_id", referencedColumnName = "store_id")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "seller_id", referencedColumnName = "user_id")
    private User seller;

    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "category_id")
    private Category category;

    private String name;
    private String description;
    private BigDecimal price;

    @Column(name = "stock_quantity")
    private int stockQuantity;

    @Column(name = "is_deleted")
    private Boolean deleted = false; // Changed from primitive boolean to wrapper Boolean with default false

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductImage> images;

    // Complete constructor including the seller field
    public Product(Store store, User seller, Category category, String name, String description, BigDecimal price, int stockQuantity) {
        this.store = store;
        this.seller = seller;
        this.category = category;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.deleted = false;
    }
}
