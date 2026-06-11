USE biblioteca_digital;

-- Ejecutar sobre bases existentes antes de desplegar el backend actualizado.
-- No se almacena numero completo de tarjeta ni CVV.

ALTER TABLE sales
  ADD COLUMN card_holder VARCHAR(120) NULL AFTER payment_method,
  ADD COLUMN card_last4 CHAR(4) NULL AFTER card_holder,
  ADD COLUMN payment_reference VARCHAR(64) NULL AFTER card_last4,
  ADD INDEX ix_sales_payment_reference (payment_reference);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('purchase','loan','system') NOT NULL DEFAULT 'system',
  title VARCHAR(120) NOT NULL,
  message VARCHAR(255) NOT NULL,
  related_book_id INT UNSIGNED NULL,
  related_sale_id INT UNSIGNED NULL,
  related_loan_id INT UNSIGNED NULL,
  is_read TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (related_book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (related_sale_id) REFERENCES sales(sale_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (related_loan_id) REFERENCES loans(loan_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  INDEX ix_notifications_user_read (user_id, is_read),
  INDEX ix_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
