-- Lookup tables for fixed types (no soft delete flags)
CREATE TABLE user_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE payment_method (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Users and addresses
CREATE TABLE `user` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    user_type_id INT NOT NULL,
    delete_flag TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_type_id) REFERENCES user_type(id)
) ENGINE=InnoDB;

INSERT into user_type (id, type_name) VALUES
(1, 'admin'),
(2, 'seller'),
(3, 'customer');

CREATE TABLE address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    delete_flag TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB;

-- Brands and seller-brand association
CREATE TABLE brand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    delete_flag TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE user_brand (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    brand_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES `user`(id),
    FOREIGN KEY (brand_id) REFERENCES brand(id),
    UNIQUE KEY(user_id, brand_id)
) ENGINE=InnoDB;

-- Products and images
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    seller_id INT NOT NULL,
    brand_id INT,
    delete_flag TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (seller_id) REFERENCES `user`(id),
    FOREIGN KEY (brand_id) REFERENCES brand(id)
) ENGINE=InnoDB;

CREATE TABLE product_image (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB;

-- Orders and order items
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    shipment_status ENUM('SHIPPED','CANCELED','DELIVERED') NOT NULL,
    address_id INT NOT NULL,
    order_date DATETIME NOT NULL,
    delete_flag TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES `user`(id),
    FOREIGN KEY (address_id) REFERENCES address(id)
) ENGINE=InnoDB;

CREATE TABLE order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_order_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB;

-- Transactions
CREATE TABLE transaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    transaction_date DATETIME NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_method(id)
) ENGINE=InnoDB;


insert INTO users (name, email, password, user_type_id) VALUES
('admin', 'admin@gmail.com','admin',1);