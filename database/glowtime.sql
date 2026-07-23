
-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','staff','manager') NOT NULL
);

-- ==========================
-- CUSTOMERS
-- ==========================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    skin_type VARCHAR(50),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ==========================
-- STAFFS
-- ==========================
CREATE TABLE staffs (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    position VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ==========================
-- BRANDS
-- ==========================
CREATE TABLE brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    country VARCHAR(100)
);

-- ==========================
-- CATEGORIES
-- ==========================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    skin_type_target VARCHAR(100)
);

-- ==========================
-- PRODUCTS
-- ==========================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT,
    category_id INT,
    name VARCHAR(255),
    ingredients TEXT,
    price DECIMAL(10,2),
    stock_qty INT,
    expiry_date DATE,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- ==========================
-- PRODUCT IMAGES
-- ==========================
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ==========================
-- CARTS
-- ==========================
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNIQUE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- ==========================
-- CART ITEMS
-- ==========================
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    qty INT,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ==========================
-- ORDERS
-- ==========================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME,
    status VARCHAR(50),
    total_amount DECIMAL(10,2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- ==========================
-- ORDER ITEMS
-- ==========================
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    qty INT,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ==========================
-- PAYMENTS
-- ==========================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    method VARCHAR(50),
    status VARCHAR(50),
    amount DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ==========================
-- SHIPMENTS
-- ==========================
CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNIQUE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    status VARCHAR(50),
    shipped_at DATETIME,
    delivered_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ==========================
-- REVIEWS
-- ==========================
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    customer_id INT,
    order_id INT,
    rating INT,
    comment TEXT,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ======================
-- USERS
-- ======================
INSERT INTO users (username,email,password_hash,role) VALUES
('customer01','customer01@gmail.com','123456','customer'),
('customer02','customer02@gmail.com','123456','customer'),
('customer03','customer03@gmail.com','123456','customer'),
('customer04','customer04@gmail.com','123456','customer'),
('customer05','customer05@gmail.com','123456','customer'),
('staff01','staff01@gmail.com','123456','staff'),
('staff02','staff02@gmail.com','123456','staff'),
('manager01','manager01@gmail.com','123456','manager');

-- ======================
-- CUSTOMERS
-- ======================
INSERT INTO customers (user_id,skin_type,phone) VALUES
(1,'Oily','0811111111'),
(2,'Dry','0822222222'),
(3,'Combination','0833333333'),
(4,'Sensitive','0844444444'),
(5,'Normal','0855555555');

-- ======================
-- STAFFS
-- ======================
INSERT INTO staffs (user_id,position) VALUES
(6,'Warehouse'),
(7,'Sales');

-- ======================
-- BRANDS
-- ======================
INSERT INTO brands (name,country) VALUES
('Anua','South Korea'),
('SKINTIFIC','Indonesia'),
('Beauty of Joseon','South Korea'),
('COSRX','South Korea'),
('La Roche-Posay','France');

-- ======================
-- CATEGORIES
-- ======================
INSERT INTO categories (name,skin_type_target) VALUES
('Cleanser','All'),
('Toner','Sensitive'),
('Serum','Dry'),
('Moisturizer','All'),
('Sunscreen','All');

-- ======================
-- PRODUCTS
-- ======================
INSERT INTO products
(brand_id,category_id,name,ingredients,price,stock_qty,expiry_date)
VALUES
(1,2,'Anua Heartleaf Toner','Heartleaf Extract',690,100,'2028-12-31'),
(2,3,'SKINTIFIC Niacinamide Serum','Niacinamide',490,120,'2028-11-30'),
(3,4,'BOJ Dynasty Cream','Ginseng',850,80,'2028-10-31'),
(4,1,'COSRX Low pH Cleanser','Tea Tree',420,150,'2028-09-30'),
(5,5,'La Roche-Posay Anthelios SPF50','Mexoryl XL',990,70,'2028-08-31'),
(1,3,'Anua Peach Serum','Peach Extract',750,90,'2028-07-31'),
(2,4,'SKINTIFIC Moisture Gel','Ceramide',550,100,'2028-06-30'),
(3,5,'BOJ Relief Sun','Rice Extract',620,130,'2028-05-31'),
(4,2,'COSRX Propolis Toner','Propolis',680,95,'2028-04-30'),
(5,1,'Effaclar Cleanser','Salicylic Acid',790,60,'2028-03-31');

-- ======================
-- PRODUCT IMAGES
-- ======================
INSERT INTO product_images(product_id,image_url) VALUES
(1,'anua1.jpg'),
(2,'skintific1.jpg'),
(3,'boj1.jpg'),
(4,'cosrx1.jpg'),
(5,'laroche1.jpg'),
(6,'anua2.jpg'),
(7,'skintific2.jpg'),
(8,'boj2.jpg'),
(9,'cosrx2.jpg'),
(10,'laroche2.jpg');

-- ======================
-- CARTS
-- ======================
INSERT INTO carts(customer_id) VALUES
(1),(2),(3),(4),(5);

-- ======================
-- CART ITEMS
-- ======================
INSERT INTO cart_items(cart_id,product_id,qty) VALUES
(1,1,2),
(1,5,1),
(2,3,1),
(3,7,2),
(4,2,1),
(5,10,3);

-- ======================
-- ORDERS
-- ======================
INSERT INTO orders(customer_id,order_date,status,total_amount) VALUES
(1,NOW(),'Confirmed',2370),
(2,NOW(),'Shipping',850),
(3,NOW(),'Delivered',1100),
(4,NOW(),'Pending',490),
(5,NOW(),'Confirmed',2370);

-- ======================
-- ORDER ITEMS
-- ======================
INSERT INTO order_items(order_id,product_id,qty,unit_price) VALUES
(1,1,2,690),
(1,5,1,990),
(2,3,1,850),
(3,7,2,550),
(4,2,1,490),
(5,10,3,790);

-- ======================
-- PAYMENTS
-- ======================
INSERT INTO payments(order_id,method,status,amount) VALUES
(1,'QR Code','Paid',2370),
(2,'Credit Card','Paid',850),
(3,'Bank Transfer','Paid',1100),
(4,'QR Code','Pending',490),
(5,'Credit Card','Paid',2370);

-- ======================
-- SHIPMENTS
-- ======================
INSERT INTO shipments(order_id,tracking_number,carrier,status,shipped_at,delivered_at) VALUES
(1,'TH000001','Flash Express','Shipping',NOW(),NULL),
(2,'TH000002','Kerry Express','Delivered',NOW(),NOW()),
(3,'TH000003','Thailand Post','Delivered',NOW(),NOW()),
(4,'TH000004','Flash Express','Pending',NULL,NULL),
(5,'TH000005','Kerry Express','Shipping',NOW(),NULL);

-- ======================
-- REVIEWS
-- ======================
INSERT INTO reviews(product_id,customer_id,order_id,rating,comment) VALUES
(1,1,1,5,'ใช้ดีมาก ผิวชุ่มชื้น'),
(3,2,2,4,'เนื้อครีมดี ซึมไว'),
(7,3,3,5,'ชอบมาก ใช้แล้วผิวนุ่ม'),
(2,4,4,4,'คุ้มค่ากับราคา'),
(10,5,5,5,'ล้างหน้าสะอาดมาก');

