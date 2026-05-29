USE biblioteca_digital;

-- 1) Listar libros disponibles
SELECT b.book_id, b.title, b.purchase_price, b.rental_price,
  SUM(cp.status = 'available') AS available_count
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
  SUM(cp.status = 'available') AS stock_disponible,
  SUM(cp.status IN ('loaned','reserved')) AS stock_reservado_y_prestado
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
WHERE l.status = 'overdue';

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
