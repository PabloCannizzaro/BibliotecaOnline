USE biblioteca_digital;

-- 1) Listar libros disponibles
SELECT b.book_id, b.title, b.purchase_price, b.rental_price,
  SUM(CASE WHEN cp.status = 'available' THEN 1 ELSE 0 END) AS available_count
FROM books b
LEFT JOIN copies cp ON b.book_id = cp.book_id
WHERE b.is_active = 1
GROUP BY b.book_id, b.title, b.purchase_price, b.rental_price
HAVING available_count > 0
ORDER BY b.title;

-- 2) Listar libros por categoría
SELECT b.book_id, b.title, c.name AS category
FROM books b
JOIN book_categories bc ON b.book_id = bc.book_id
JOIN categories c ON bc.category_id = c.category_id
WHERE c.name = 'Novela'
ORDER BY b.title;

-- 3) Listar préstamos activos
SELECT l.loan_id, u.first_name, u.last_name, b.title, l.loan_date, l.due_date, l.status
FROM loans l
JOIN users u ON l.user_id = u.user_id
JOIN loan_items li ON l.loan_id = li.loan_id
JOIN books b ON li.book_id = b.book_id
WHERE l.status = 'active'
ORDER BY l.due_date ASC;

-- 4) Listar compras de un usuario
SELECT s.sale_id, s.sale_date, b.title, si.quantity, si.unit_price, s.total_amount
FROM sales s
JOIN sale_items si ON s.sale_id = si.sale_id
JOIN books b ON si.book_id = b.book_id
WHERE s.user_id = 3
ORDER BY s.sale_date DESC;

-- 5) Calcular total vendido
SELECT SUM(total_amount) AS total_vendido
FROM sales
WHERE status = 'completed';

-- 6) Ver stock disponible
SELECT b.book_id, b.title,
  SUM(CASE WHEN cp.status = 'available' THEN 1 ELSE 0 END) AS stock_disponible,
  SUM(CASE WHEN cp.status IN ('loaned','reserved') THEN 1 ELSE 0 END) AS stock_reservado_y_prestado
FROM books b
LEFT JOIN copies cp ON b.book_id = cp.book_id
GROUP BY b.book_id, b.title
ORDER BY stock_disponible DESC;

-- 7) Ver libros más alquilados
SELECT b.book_id, b.title, COUNT(li.loan_item_id) AS veces_alquilado
FROM loan_items li
JOIN books b ON li.book_id = b.book_id
GROUP BY b.book_id, b.title
ORDER BY veces_alquilado DESC
LIMIT 10;

-- 8) Ver libros más comprados
SELECT b.book_id, b.title, SUM(si.quantity) AS unidades_vendidas
FROM sale_items si
JOIN books b ON si.book_id = b.book_id
GROUP BY b.book_id, b.title
ORDER BY unidades_vendidas DESC
LIMIT 10;

-- 9) Ver usuarios con préstamos vencidos
SELECT DISTINCT u.user_id, u.first_name, u.last_name, u.email
FROM loans l
JOIN users u ON l.user_id = u.user_id
WHERE l.return_date IS NULL
  AND l.due_date < NOW()
  AND l.status IN ('active', 'overdue');

-- 10) Buscar libros por autor, título o categoría
SELECT DISTINCT b.book_id, b.title, GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS autores,
  GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categorias
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

-- 11) Ver notificaciones pendientes de un usuario
SELECT notification_id, type, title, message, created_at
FROM notifications
WHERE user_id = 3 AND is_read = 0
ORDER BY created_at DESC;

-- 12) Verificar que los usuarios administradores tengan el rol correcto.
-- Resultado esperado con seed_final.sql: 2 filas y admin_access_ready = 'OK'.
SELECT u.user_id, u.email, r.role_name, u.status,
  CASE
    WHEN r.role_name = 'admin' AND u.status = 'active' THEN 'OK'
    ELSE 'ERROR'
  END AS admin_access_ready
FROM users u
JOIN roles r ON r.role_id = u.role_id
WHERE u.email IN ('admin@example.com', 'valeria@example.com')
ORDER BY u.user_id;

-- 13) Resumen principal del panel administrador.
-- Resultado esperado: 17 usuarios activos, 31 libros activos, 3 ventas
-- completadas por 175.00, 1 prestamo activo y 1 vencido.
SELECT
  (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
  (SELECT COUNT(*) FROM books WHERE is_active = 1) AS active_books,
  (SELECT COUNT(*) FROM sales WHERE status = 'completed') AS completed_sales,
  (SELECT COALESCE(SUM(total_amount), 0.00) FROM sales WHERE status = 'completed') AS total_sales_amount,
  (SELECT COUNT(*) FROM loans WHERE status = 'active' AND return_date IS NULL AND due_date >= NOW()) AS active_loans,
  (SELECT COUNT(*) FROM loans
    WHERE return_date IS NULL
      AND due_date < NOW()
      AND status IN ('active', 'overdue')) AS overdue_loans;

-- 14) Libros con stock bajo para /api/admin/books/low-stock.
-- Resultado esperado: una o mas filas; los libros con stock igual al minimo
-- tambien se consideran de stock bajo.
SELECT b.book_id, b.title, b.stock_minimum,
  COUNT(cp.copy_id) AS total_copies,
  SUM(CASE WHEN cp.status = 'available' THEN 1 ELSE 0 END) AS available_copies
FROM books b
LEFT JOIN copies cp ON cp.book_id = b.book_id
WHERE b.is_active = 1
GROUP BY b.book_id, b.title, b.stock_minimum
HAVING SUM(CASE WHEN cp.status = 'available' THEN 1 ELSE 0 END) <= b.stock_minimum
ORDER BY available_copies ASC, b.title ASC;

-- 15) Prestamos vencidos para /api/admin/loans/overdue.
-- Resultado esperado: 1 fila para martin@example.com y Pequeños heroes.
SELECT l.loan_id, u.user_id, u.first_name, u.last_name, u.email,
  b.book_id, b.title, l.loan_date, l.due_date, l.status
FROM loans l
JOIN users u ON u.user_id = l.user_id
JOIN loan_items li ON li.loan_id = l.loan_id
JOIN books b ON b.book_id = li.book_id
WHERE l.return_date IS NULL
  AND l.due_date < NOW()
  AND l.status IN ('active', 'overdue')
ORDER BY l.due_date ASC;

-- 16) Ventas detalladas para /api/admin/sales.
-- Resultado esperado: 3 filas y cada subtotal debe coincidir con la venta.
SELECT s.sale_id, s.sale_date, s.status, s.payment_method,
  u.user_id, u.first_name, u.last_name, u.email,
  b.book_id, b.title, si.quantity, si.unit_price,
  (si.quantity * si.unit_price) AS item_subtotal,
  s.total_amount
FROM sales s
JOIN users u ON u.user_id = s.user_id
JOIN sale_items si ON si.sale_id = s.sale_id
JOIN books b ON b.book_id = si.book_id
ORDER BY s.sale_date DESC, s.sale_id DESC;

-- 17) Control de integridad entre ejemplares y libros prestados.
-- Resultado esperado: 0 filas.
SELECT li.loan_item_id, li.loan_id, li.copy_id,
  li.book_id AS loan_book_id, cp.book_id AS copy_book_id
FROM loan_items li
JOIN copies cp ON cp.copy_id = li.copy_id
WHERE li.book_id <> cp.book_id;

-- 18) Ejemplares marcados como prestados sin un prestamo vigente.
-- Resultado esperado: 0 filas.
SELECT cp.copy_id, cp.barcode, cp.book_id, cp.status
FROM copies cp
WHERE cp.status = 'loaned'
  AND NOT EXISTS (
    SELECT 1
    FROM loan_items li
    JOIN loans l ON l.loan_id = li.loan_id
    WHERE li.copy_id = cp.copy_id
      AND l.return_date IS NULL
      AND l.status IN ('active', 'overdue')
  );
