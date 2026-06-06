CREATE DATABASE IF NOT EXISTS homecare_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE homecare_platform;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  level_name VARCHAR(30) DEFAULT '普通会员',
  avatar_url MEDIUMTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  contact_name VARCHAR(50) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  address_detail VARCHAR(255) NOT NULL,
  is_default TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_code VARCHAR(50) NOT NULL UNIQUE,
  service_name VARCHAR(100) NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit_name VARCHAR(20) NOT NULL,
  duration_desc VARCHAR(50),
  description_text VARCHAR(500),
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS providers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  provider_code VARCHAR(50) NOT NULL UNIQUE,
  provider_name VARCHAR(100) NOT NULL,
  title_name VARCHAR(50),
  phone VARCHAR(20),
  rating DECIMAL(3, 2) DEFAULT 5.00,
  service_type VARCHAR(50),
  work_status VARCHAR(20) DEFAULT '空闲',
  service_area VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  service_item_id BIGINT NOT NULL,
  provider_id BIGINT,
  order_status VARCHAR(20) NOT NULL,
  appointment_time DATETIME NOT NULL,
  address_detail VARCHAR(255) NOT NULL,
  remark_text VARCHAR(500),
  base_amount DECIMAL(10, 2) NOT NULL,
  service_fee DECIMAL(10, 2) NOT NULL,
  pay_amount DECIMAL(10, 2) NOT NULL,
  paid_at DATETIME,
  assigned_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  rating INT NOT NULL,
  review_content VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  pay_no VARCHAR(50) NOT NULL UNIQUE,
  pay_amount DECIMAL(10, 2) NOT NULL,
  pay_status VARCHAR(20) NOT NULL,
  pay_channel VARCHAR(30) DEFAULT 'mock',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, phone, password, role, level_name)
VALUES ('林然', '13800000000', '123456', 'customer', '尊享会员');

INSERT INTO service_items (service_code, service_name, category_name, price, unit_name, duration_desc, description_text)
VALUES
('svc-001', '深度全屋消杀', '除虫消杀', 180.00, '次', '2-3小时', '适合新房入住、换季除螨和家庭深度消毒。'),
('svc-002', '厨房深度保洁', '家庭保洁', 190.00, '次', '3小时', '针对油烟机外部、灶台和墙面做深度清洁。'),
('svc-003', '水龙头维修', '家电维修', 110.00, '次', '1小时', '处理漏水、松动、阀芯老化等问题。');

INSERT INTO providers (provider_code, provider_name, title_name, phone, rating, service_type, work_status, service_area)
VALUES
('provider-1', 'Elena Rodriguez', '资深电工', '13900000001', 4.90, '家电维修', '空闲', '静安/徐汇/长宁'),
('provider-2', 'Sarah Jenkins', '深度保洁专家', '13900000002', 4.80, '家庭保洁', '任务中', '浦东/黄浦/闵行'),
('provider-3', 'Maria Garcia', '金牌保洁专家', '13900000003', 4.80, '深度保洁', '空闲', '徐汇/黄浦/杨浦');
