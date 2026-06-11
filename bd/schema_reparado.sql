-- Biblioteca Digital: esquema completo de base de datos
-- Archivo reparado: se reemplazó condition por copy_condition y TINYINT(1) por TINYINT UNSIGNED
-- Base de datos diseñada para MySQL/MariaDB

CREATE DATABASE IF NOT EXISTS biblioteca_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca_digital;

-- Roles de usuario: administradores y usuarios regulares.
CREATE TABLE IF NOT EXISTS roles (
  role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(32) NOT NULL UNIQUE,
  description VARCHAR(128) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios del sistema.
CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Autores con información básica.
CREATE TABLE IF NOT EXISTS authors (
  author_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  biography TEXT NULL,
  country VARCHAR(60) NULL,
  UNIQUE KEY ux_authors_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Editoriales (publishers).
CREATE TABLE IF NOT EXISTS publishers (
  publisher_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  website VARCHAR(200) NULL,
  country VARCHAR(60) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorías de libros.
CREATE TABLE IF NOT EXISTS categories (
  category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description VARCHAR(180) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Libros principales.
CREATE TABLE IF NOT EXISTS books (
  book_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  publisher_id INT UNSIGNED NOT NULL,
  publication_year YEAR NULL,
  purchase_price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  rental_price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  stock_minimum INT UNSIGNED NOT NULL DEFAULT 1,
  is_active TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (publisher_id) REFERENCES publishers(publisher_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_books_title (title),
  INDEX ix_books_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Libros autores: relación muchos a muchos.
CREATE TABLE IF NOT EXISTS book_authors (
  book_id INT UNSIGNED NOT NULL,
  author_id INT UNSIGNED NOT NULL,
  PRIMARY KEY(book_id, author_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES authors(author_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Libros categorías: relación muchos a muchos.
CREATE TABLE IF NOT EXISTS book_categories (
  book_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY(book_id, category_id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ejemplares individuales de cada libro.
CREATE TABLE IF NOT EXISTS copies (
  copy_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  barcode VARCHAR(60) NOT NULL UNIQUE,
  status ENUM('available','loaned','reserved','sold','damaged','inactive') NOT NULL DEFAULT 'available',
  copy_condition ENUM('new','good','used','damaged') NOT NULL DEFAULT 'good',
  acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX ix_copies_status (status),
  INDEX ix_copies_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Historial de cambios de precios de cada libro.
CREATE TABLE IF NOT EXISTS price_history (
  price_history_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  old_purchase_price DECIMAL(8,2) NOT NULL,
  new_purchase_price DECIMAL(8,2) NOT NULL,
  old_rental_price DECIMAL(8,2) NOT NULL,
  new_rental_price DECIMAL(8,2) NOT NULL,
  changed_by INT UNSIGNED NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason VARCHAR(200) NULL,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_price_history_book (book_id),
  INDEX ix_price_history_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ventas realizadas por usuarios normales.
CREATE TABLE IF NOT EXISTS sales (
  sale_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('completed','cancelled') NOT NULL DEFAULT 'completed',
  payment_method VARCHAR(60) NOT NULL DEFAULT 'tarjeta',
  card_holder VARCHAR(120) NULL,
  card_last4 CHAR(4) NULL,
  payment_reference VARCHAR(64) NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_sales_user (user_id),
  INDEX ix_sales_date (sale_date),
  INDEX ix_sales_payment_reference (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Detalle de cada venta.
CREATE TABLE IF NOT EXISTS sale_items (
  sale_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_sale_items_sale (sale_id),
  INDEX ix_sale_items_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Préstamos y alquileres.
CREATE TABLE IF NOT EXISTS loans (
  loan_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  loan_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL,
  return_date DATETIME NULL,
  status ENUM('active','returned','overdue','cancelled') NOT NULL DEFAULT 'active',
  rental_fee DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_loans_user (user_id),
  INDEX ix_loans_status (status),
  INDEX ix_loans_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Detalle del préstamo.
CREATE TABLE IF NOT EXISTS loan_items (
  loan_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  loan_id INT UNSIGNED NOT NULL,
  copy_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (copy_id) REFERENCES copies(copy_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_loan_items_loan (loan_id),
  INDEX ix_loan_items_copy (copy_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reseñas de usuarios sobre libros.
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CHECK (rating BETWEEN 1 AND 5),
  INDEX ix_reviews_book (book_id),
  INDEX ix_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movimientos de stock para auditoría.
CREATE TABLE IF NOT EXISTS stock_movements (
  movement_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  copy_id INT UNSIGNED NULL,
  quantity INT NOT NULL DEFAULT 1,
  movement_type ENUM('stock-in','sale','loan','return','adjustment') NOT NULL,
  movement_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(200) NULL,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (copy_id) REFERENCES copies(copy_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  INDEX ix_stock_movements_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reservas llenan el circuito de biblioteca.
CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  reserved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  status ENUM('pending','fulfilled','cancelled','expired') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX ix_reservations_user (user_id),
  INDEX ix_reservations_book (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carrito de compras con detalles.
CREATE TABLE IF NOT EXISTS carts (
  cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('open','submitted','discarded') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  INDEX ix_carts_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id INT UNSIGNED NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  item_type ENUM('purchase','rental') NOT NULL,
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  INDEX ix_cart_items_cart (cart_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notificaciones persistentes para acciones del usuario.
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
