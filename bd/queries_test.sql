-- Ejecutar sobre la base seleccionada por DB_NAME, despues de seed_final.sql.
-- Las consultas son seguras: solo lecturas, salvo una simulacion con ROLLBACK.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- 1) Verifica carga base de tablas principales.
-- Esperado con seed_final.sql: 2 roles, 17 usuarios, 30 libros, 77 ejemplares.
SELECT
  (SELECT COUNT(*) FROM roles) AS total_roles,
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM books) AS total_books,
  (SELECT COUNT(*) FROM copies) AS total_copies,
  (SELECT COUNT(*) FROM sales) AS total_sales,
  (SELECT COUNT(*) FROM loans) AS total_loans;

-- 2) Verifica roles usados por login y panel admin.
-- Esperado: roles admin y user; al menos 2 administradores activos y usuarios normales activos.
SELECT r.role_name, COUNT(u.user_id) AS users_count
FROM roles r
LEFT JOIN users u ON u.role_id = r.role_id AND u.status = 'active'
GROUP BY r.role_id, r.role_name
ORDER BY r.role_id;

-- 3) Verifica catalogo publico equivalente a GET /api/books.
-- Esperado: libros activos con autores/categorias y conteo de ejemplares disponibles sin duplicar por joins.
SELECT b.book_id, b.title, b.purchase_price, b.rental_price,
  p.name AS publisher_name,
  GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors,
  GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories,
  COUNT(DISTINCT CASE WHEN cp.status = 'available' THEN cp.copy_id END) AS available_copies
FROM books b
LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
LEFT JOIN book_categories bc ON b.book_id = bc.book_id
LEFT JOIN categories c ON bc.category_id = c.category_id
LEFT JOIN copies cp ON b.book_id = cp.book_id
WHERE b.is_active = 1
GROUP BY b.book_id, b.title, b.purchase_price, b.rental_price, p.name
ORDER BY b.title
LIMIT 10;

-- 4) Verifica filtro por categoria usado por el catalogo.
-- Esperado: libros asociados a la categoria Novela.
SELECT b.book_id, b.title, c.name AS category_name
FROM books b
JOIN book_categories bc ON b.book_id = bc.book_id
JOIN categories c ON bc.category_id = c.category_id
WHERE c.name = 'Novela'
ORDER BY b.title;

-- 5) Verifica disponibilidad por estado de ejemplar.
-- Esperado: ventas en sold, prestamos activos/vencidos en loaned y reservas pendientes en reserved.
SELECT b.book_id, b.title,
  COUNT(CASE WHEN cp.status = 'available' THEN 1 END) AS available_copies,
  COUNT(CASE WHEN cp.status = 'loaned' THEN 1 END) AS loaned_copies,
  COUNT(CASE WHEN cp.status = 'reserved' THEN 1 END) AS reserved_copies,
  COUNT(CASE WHEN cp.status = 'sold' THEN 1 END) AS sold_copies
FROM books b
LEFT JOIN copies cp ON b.book_id = cp.book_id
GROUP BY b.book_id, b.title
ORDER BY available_copies DESC, b.title
LIMIT 15;

-- 6) Verifica prestamos activos.
-- Esperado: 1 prestamo activo, con copy_id perteneciente al mismo book_id.
SELECT l.loan_id, u.email, li.copy_id, li.book_id, b.title, l.loan_date, l.due_date, l.status
FROM loans l
JOIN users u ON l.user_id = u.user_id
JOIN loan_items li ON l.loan_id = li.loan_id
JOIN books b ON li.book_id = b.book_id
JOIN copies cp ON li.copy_id = cp.copy_id AND cp.book_id = li.book_id
WHERE l.status = 'active'
ORDER BY l.due_date ASC;

-- 7) Verifica prestamos vencidos.
-- Esperado: 1 prestamo overdue con fecha de vencimiento anterior a NOW().
SELECT l.loan_id, u.email, li.copy_id, b.title, l.due_date, l.status
FROM loans l
JOIN users u ON l.user_id = u.user_id
JOIN loan_items li ON l.loan_id = li.loan_id
JOIN books b ON li.book_id = b.book_id
JOIN copies cp ON li.copy_id = cp.copy_id AND cp.book_id = li.book_id
WHERE l.status = 'overdue' AND l.due_date < NOW()
ORDER BY l.due_date ASC;

-- 8) Verifica compras y metadatos no sensibles de pago.
-- Esperado: 3 ventas completadas con payment_reference y card_last4 cargados.
SELECT s.sale_id, s.sale_date, u.email, b.title, si.quantity, si.unit_price,
  s.total_amount, s.status, s.payment_method, s.card_last4, s.payment_reference
FROM sales s
JOIN users u ON s.user_id = u.user_id
JOIN sale_items si ON s.sale_id = si.sale_id
JOIN books b ON si.book_id = b.book_id
WHERE s.status = 'completed'
ORDER BY s.sale_date DESC;

-- 9) Verifica total vendido y unidades vendidas.
-- Esperado: total_vendido 175.00 y unidades_vendidas 3 con seed_final.sql.
SELECT
  (SELECT COALESCE(SUM(s.total_amount), 0) FROM sales s WHERE s.status = 'completed') AS total_vendido,
  (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.sale_id
    WHERE s.status = 'completed'
  ) AS unidades_vendidas;

-- 10) Verifica libros mas prestados.
-- Esperado: incluye los libros de los tres prestamos de ejemplo.
SELECT b.book_id, b.title, COUNT(li.loan_item_id) AS veces_prestado
FROM loan_items li
JOIN books b ON li.book_id = b.book_id
GROUP BY b.book_id, b.title
ORDER BY veces_prestado DESC, b.title
LIMIT 10;

-- 11) Verifica libros mas comprados.
-- Esperado: incluye La casa del faro, Sombras de ciudad y Ecos del universo.
SELECT b.book_id, b.title, SUM(si.quantity) AS unidades_vendidas
FROM sale_items si
JOIN books b ON si.book_id = b.book_id
GROUP BY b.book_id, b.title
ORDER BY unidades_vendidas DESC, b.title
LIMIT 10;

-- 12) Verifica usuarios con prestamos vencidos.
-- Esperado: 1 usuario con prestamo overdue.
SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email
FROM loans l
JOIN users u ON l.user_id = u.user_id
WHERE l.status = 'overdue';

-- 13) Verifica busqueda por titulo, autor o categoria.
-- Esperado: resultados por "viaje", autor Mateo o categoria Ciencia.
SELECT b.book_id, b.title,
  GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') AS authors,
  GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS categories
FROM books b
LEFT JOIN book_authors ba ON b.book_id = ba.book_id
LEFT JOIN authors a ON ba.author_id = a.author_id
LEFT JOIN book_categories bc ON b.book_id = bc.book_id
LEFT JOIN categories c ON bc.category_id = c.category_id
WHERE b.title LIKE '%viaje%'
  OR a.name LIKE '%Mateo%'
  OR c.name LIKE '%Ciencia%'
GROUP BY b.book_id, b.title
ORDER BY b.title;

-- 14) Verifica notificaciones pendientes de un usuario.
-- Esperado: usuario 3 tiene 1 notificacion sin leer por compra.
SELECT n.notification_id, n.type, n.title, n.message, n.related_book_id,
  n.related_sale_id, n.related_loan_id, n.created_at
FROM notifications n
WHERE n.user_id = 3 AND n.is_read = 0
ORDER BY n.created_at DESC;

-- 15) Verifica reservas pendientes y copias reservadas.
-- Esperado: libros 6 y 13 tienen reservas pending y al menos una copia reserved.
SELECT r.reservation_id, u.email, b.title, r.status, r.expires_at,
  COUNT(CASE WHEN cp.status = 'reserved' THEN 1 END) AS reserved_copies
FROM reservations r
JOIN users u ON r.user_id = u.user_id
JOIN books b ON r.book_id = b.book_id
LEFT JOIN copies cp ON cp.book_id = b.book_id
WHERE r.status = 'pending'
GROUP BY r.reservation_id, u.email, b.title, r.status, r.expires_at
ORDER BY r.expires_at ASC;

-- 16) Verifica estadisticas administrativas equivalentes a GET /api/admin/stats.
-- Esperado: totales coherentes con seed_final.sql y al menos ventas/prestamos cargados.
SELECT
  (SELECT COUNT(*) FROM books) AS total_books,
  (SELECT COUNT(*) FROM books WHERE is_active = 1) AS active_books,
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM users WHERE status = 'active' AND role_id != 1) AS active_users,
  (SELECT COUNT(*) FROM copies WHERE status = 'available') AS available_copies,
  (SELECT COUNT(*) FROM loans WHERE status = 'active') AS active_loans,
  (SELECT COUNT(*) FROM loans WHERE status = 'overdue') AS overdue_loans,
  (SELECT COUNT(*) FROM sales WHERE status = 'completed') AS completed_sales,
  (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE status = 'completed') AS total_sold;

-- 17) Verifica libros con bajo stock segun regla administrativa.
-- Esperado: libros activos cuya disponibilidad es menor o igual a stock_minimum.
SELECT b.book_id, b.title, b.stock_minimum,
  COUNT(CASE WHEN cp.status = 'available' THEN 1 END) AS available_copies
FROM books b
LEFT JOIN copies cp ON b.book_id = cp.book_id
WHERE b.is_active = 1
GROUP BY b.book_id, b.title, b.stock_minimum
HAVING available_copies <= b.stock_minimum
ORDER BY available_copies ASC, b.title
LIMIT 20;

-- 18) Simula una compra dentro de una transaccion y revierte todo.
-- Esperado: dentro de la transaccion aparece 1 venta temporal; despues del ROLLBACK no queda persistida.
START TRANSACTION;

SET @test_user_id := 3;
SET @test_book_id := 4;
SET @test_copy_id := (
  SELECT cp.copy_id
  FROM copies cp
  WHERE cp.book_id = @test_book_id AND cp.status = 'available'
  ORDER BY cp.copy_id
  LIMIT 1
);
SET @test_price := (SELECT b.purchase_price FROM books b WHERE b.book_id = @test_book_id);
SET @test_payment_reference := CONCAT('ROLLBACK-', UUID());

INSERT INTO sales (user_id, sale_date, total_amount, status, payment_method, card_holder, card_last4, payment_reference)
VALUES (@test_user_id, NOW(), @test_price, 'completed', 'tarjeta', 'Usuario Test', '4242', @test_payment_reference);

SET @test_sale_id := LAST_INSERT_ID();

INSERT INTO sale_items (sale_id, book_id, quantity, unit_price)
VALUES (@test_sale_id, @test_book_id, 1, @test_price);

UPDATE copies SET status = 'sold' WHERE copy_id = @test_copy_id;

INSERT INTO stock_movements (book_id, copy_id, quantity, movement_type, movement_date, note)
VALUES (@test_book_id, @test_copy_id, 1, 'sale', NOW(), 'Simulacion queries_test con rollback');

INSERT INTO notifications (user_id, type, title, message, related_book_id, related_sale_id, is_read, created_at)
VALUES (@test_user_id, 'purchase', 'Compra simulada', 'Compra simulada por queries_test.', @test_book_id, @test_sale_id, 0, NOW());

SELECT s.sale_id, s.payment_reference, COUNT(si.sale_item_id) AS sale_items,
  cp.status AS temporary_copy_status
FROM sales s
JOIN sale_items si ON s.sale_id = si.sale_id
JOIN copies cp ON cp.copy_id = @test_copy_id
WHERE s.sale_id = @test_sale_id
GROUP BY s.sale_id, s.payment_reference, cp.status;

ROLLBACK;

SELECT COUNT(*) AS rollback_sale_count
FROM sales s
WHERE s.payment_reference = @test_payment_reference;
