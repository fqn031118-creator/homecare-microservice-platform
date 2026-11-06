

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

-- Service and staff seed data; accounts are provisioned only with the demo profile.
INSERT INTO service_items (service_code,service_name,category_name,price,unit_name,duration_desc,description_text) VALUES
('svc-001','深度全屋消杀','除虫消杀',180,'次','2-3小时','整屋消毒与除螨'),
('svc-002','厨房深度保洁','家庭保洁',190,'次','3小时','厨房深度清洁'),
('svc-003','水龙头维修','家电维修',110,'次','1小时','漏水与阀芯维修'),
('svc-004','空调系统检查','家电维修',120,'次','1.5小时','空调检测维护');
INSERT INTO providers(provider_code,provider_name,title_name,phone,rating,service_type,work_status,service_area) VALUES
('provider-1','Elena Rodriguez','资深电工','13900000001',4.9,'家电维修','空闲','静安/徐汇/长宁'),
('provider-2','Sarah Jenkins','深度保洁专家','13900000000',4.8,'家庭保洁','空闲','浦东/黄浦/闵行'),
('provider-3','Maria Garcia','金牌保洁专家','13900000003',4.8,'深度保洁','空闲','徐汇/黄浦/杨浦'),
('provider-4','Liam Zhou','家电清洗工程师','13900000004',4.7,'家电维修','空闲','浦东/宝山/普陀');
-- Apply once after backing up the existing database. Do not rerun.
CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash CHAR(64) PRIMARY KEY, user_id BIGINT NOT NULL, expires_at DATETIME NOT NULL,
 CONSTRAINT fk_session_user FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS provider_accounts (
 user_id BIGINT PRIMARY KEY, provider_id BIGINT NOT NULL UNIQUE, online BOOLEAN NOT NULL DEFAULT TRUE,
 CONSTRAINT fk_account_user FOREIGN KEY(user_id) REFERENCES users(id),
 CONSTRAINT fk_account_provider FOREIGN KEY(provider_id) REFERENCES providers(id)
);
CREATE TABLE IF NOT EXISTS order_events (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, order_no VARCHAR(50) NOT NULL, actor_id BIGINT NOT NULL,
 action_name VARCHAR(30) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_event_order FOREIGN KEY(order_no) REFERENCES orders(order_no),
 CONSTRAINT fk_event_user FOREIGN KEY(actor_id) REFERENCES users(id)
);
ALTER TABLE orders ADD COLUMN contact_name VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN contact_phone VARCHAR(20) NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN cancelled_at DATETIME;
ALTER TABLE orders ADD COLUMN cancellation_reason VARCHAR(500) DEFAULT '';
ALTER TABLE orders ADD COLUMN refund_status VARCHAR(20) NOT NULL DEFAULT '未申请';
ALTER TABLE orders ADD COLUMN refund_reason VARCHAR(500) DEFAULT '';
ALTER TABLE orders ADD COLUMN complaint_status VARCHAR(20) NOT NULL DEFAULT '无投诉';
ALTER TABLE orders ADD COLUMN complaint_content VARCHAR(500) DEFAULT '';
CREATE INDEX idx_orders_user ON orders(user_id,created_at);
CREATE INDEX idx_orders_provider_status ON orders(provider_id,order_status);
CREATE UNIQUE INDEX uk_payment_order ON payment_records(order_id);
ALTER TABLE orders ADD CONSTRAINT fk_order_user FOREIGN KEY(user_id) REFERENCES users(id);
ALTER TABLE orders ADD CONSTRAINT fk_order_service FOREIGN KEY(service_item_id) REFERENCES service_items(id);
ALTER TABLE orders ADD CONSTRAINT fk_order_provider FOREIGN KEY(provider_id) REFERENCES providers(id);
ALTER TABLE order_reviews ADD CONSTRAINT fk_review_order FOREIGN KEY(order_id) REFERENCES orders(id);
ALTER TABLE payment_records ADD CONSTRAINT fk_payment_order FOREIGN KEY(order_id) REFERENCES orders(id);
