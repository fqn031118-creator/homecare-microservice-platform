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
