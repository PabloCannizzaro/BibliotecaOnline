SET NAMES utf8mb4;
USE biblioteca_digital;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE reservations;
TRUNCATE TABLE stock_movements;
TRUNCATE TABLE reviews;
TRUNCATE TABLE loan_items;
TRUNCATE TABLE loans;
TRUNCATE TABLE sale_items;
TRUNCATE TABLE sales;
TRUNCATE TABLE price_history;
TRUNCATE TABLE copies;
TRUNCATE TABLE book_categories;
TRUNCATE TABLE book_authors;
TRUNCATE TABLE books;
TRUNCATE TABLE categories;
TRUNCATE TABLE publishers;
TRUNCATE TABLE authors;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'Administrador del sistema con acceso al panel y edición de contenido'),
('user', 'Usuario normal que puede comprar y alquilar libros');

-- Categorías
INSERT INTO categories (name, description) VALUES
('Novela', 'Historias narrativas para público general.'),
('Ciencia', 'Divulgación y ciencias exactas.'),
('Historia', 'Relatos del pasado y análisis históricos.'),
('Tecnología', 'Libros de desarrollo, programación y tecnología.'),
('Infantil', 'Libros para niños con historias y aventuras.'),
('Académicos', 'Textos para estudio y formación profesional.');

-- Editoriales
INSERT INTO publishers (name, website, country) VALUES
('Editorial Aurora', 'https://auroraeditorial.example.com', 'Argentina'),
('Luz y Letras', 'https://luzyletras.example.com', 'España'),
('Marea Books', 'https://mareabooks.example.com', 'Chile'),
('Nexo Editorial', 'https://nexoeditorial.example.com', 'México'),
('Vértice Press', 'https://verticepress.example.com', 'Colombia');

-- Autores
INSERT INTO authors (name, biography, country) VALUES
('Miguel Barrera', 'Narrador contemporáneo especializado en historias de costa y memoria.', 'Argentina'),
('Paula Mendoza', 'Escritora de ficción urbana con un estilo introspectivo.', 'Chile'),
('Mateo Ruiz', 'Físico y divulgador científico centrado en astronomía.', 'España'),
('Carolina Vega', 'Investigadora de historia cultural y narrativa familiar.', 'México'),
('Diego San Martín', 'Ingeniero de software apasionado por el futuro y las ciudades inteligentes.', 'Colombia'),
('Sofía Klein', 'Autora infantil que combina fantasía y valores familiares.', 'Argentina'),
('Tomás Alcalá', 'Periodista que explora viajes y culturas lejanas.', 'España'),
('Melisa Figueroa', 'Especialista en libros de crecimiento personal y emociones.', 'Chile'),
('Helena Costa', 'Médica y divulgadora de ciencia aplicada a la vida cotidiana.', 'Portugal'),
('Lucas Pereyra', 'Estudioso de geografía y ambientes naturales.', 'Argentina');

-- Libros
INSERT INTO books (title, description, publisher_id, publication_year, purchase_price, rental_price, stock_minimum, is_active) VALUES
('La casa del faro', 'Una novela romántica con misterio, recuerdos y mar argentino.', 1, 2021, 55.00, 10.00, 2, 1),
('Sombras de ciudad', 'Trama urbana con personajes que buscan reinventarse.', 2, 2020, 48.00, 9.50, 2, 1),
('Ecos del universo', 'Viaje por los últimos descubrimientos del cosmos.', 3, 2023, 72.00, 14.00, 2, 1),
('Rutas de la historia', 'Recorrido por los hitos que cambiaron el mundo.', 4, 2019, 65.00, 12.00, 2, 1),
('Código futuro', 'Exploración de sistemas inteligentes y diseño del mañana.', 5, 2022, 60.00, 11.50, 2, 1),
('El viaje de Nalu', 'Aventura marina para lectores jóvenes con mensaje ecológico.', 1, 2022, 39.00, 8.00, 2, 1),
('Horizontes lejanos', 'Relatos de viajes y autopistas de descubrimiento.', 2, 2021, 46.00, 9.00, 2, 1),
('El jardín secreto', 'Magia y amistad en un jardín olvidado.', 3, 2018, 42.00, 8.50, 2, 1),
('La clave de la vida', 'Ensayo sobre salud, bienestar y decisiones cotidianas.', 4, 2024, 58.00, 11.00, 2, 1),
('Donde nace el mar', 'Una novela sobre familias y costas perdidas.', 5, 2020, 50.00, 9.80, 2, 1),
('Ciencia al alcance', 'Guía clara para entender la física moderna.', 3, 2021, 54.00, 10.00, 2, 1),
('Memorias del tiempo', 'Historia personal entre grandes hechos históricos.', 1, 2019, 49.00, 9.20, 2, 1),
('Ingeniería humana', 'Reflexión sobre tecnología, ética y sociedad.', 5, 2023, 62.00, 12.50, 2, 1),
('Pequeños héroes', 'Relatos infantiles de coraje y amistad.', 2, 2017, 35.00, 7.50, 2, 1),
('Atlas del pasado', 'Guía ilustrada para jóvenes lectores de historia.', 4, 2018, 43.00, 8.50, 2, 1),
('Fronteras digitales', 'Panorama de la transformación tecnológica global.', 5, 2024, 68.00, 13.00, 2, 1),
('Tardes de verano', 'Novela contemporánea ambientada en ciudades costeras.', 1, 2020, 47.00, 9.00, 2, 1),
('Luz interior', 'Ensayo sobre cuidado emocional y hábitos saludables.', 2, 2022, 44.00, 9.20, 2, 1),
('Secretos de los ancestros', 'Historia familiar entre ruinas y secretos.', 4, 2021, 53.00, 10.50, 2, 1),
('Aprende a programar', 'Manual práctico para iniciarse en la programación.', 5, 2023, 61.00, 12.00, 2, 1),
('La aventura lunar', 'Cuento infantil sobre un viaje a la luna.', 3, 2021, 37.00, 7.80, 2, 1),
('Explora las ciencias', 'Introducción para niños a la naturaleza y experimentos.', 1, 2020, 38.00, 8.00, 2, 1),
('Estrategias de éxito', 'Guía académica para estudiar con propósito.', 4, 2022, 55.00, 11.20, 2, 1),
('Corazón de la ciudad', 'Novela romántica con giros de misterio.', 2, 2024, 52.00, 10.00, 2, 1),
('Biografías que inspiran', 'Selección de vidas destacadas de la actualidad.', 3, 2023, 59.00, 11.70, 2, 1),
('El código del mañana', 'Narrativa futurista con programas y ciudades inteligentes.', 5, 2025, 70.00, 13.50, 2, 1),
('Historias de la infancia', 'Cuentos cortos para leer en familia.', 1, 2019, 36.00, 7.90, 2, 1),
('El océano interior', 'Mitología infantil sobre mares y criaturas.', 2, 2018, 34.00, 7.60, 2, 1),
('Redes y sistemas', 'Libro técnico sobre infraestructura digital.', 5, 2022, 63.00, 12.60, 2, 1),
('El tiempo y sus misterios', 'Ensayo divulgativo sobre el universo y el tiempo.', 3, 2024, 64.00, 12.90, 2, 1),
('Viajeros del ayer', 'Crónica de expediciones históricas y descubrimientos.', 4, 2020, 51.00, 10.30, 2, 1);

-- Relación libro-autores
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1),(2, 2),(3, 3),(4, 4),(5, 5),(6, 6),(7, 7),(8, 8),(9, 9),(10, 10),
(11, 3),(12, 4),(13, 5),(14, 6),(15, 7),(16, 5),(17, 2),(18, 8),(19, 1),(20, 5),
(21, 6),(22, 7),(23, 9),(24, 10),(25, 5),(26, 8),(27, 6),(28, 7),(29, 3),(30, 4);

-- Algunos libros con múltiples autores.
INSERT INTO book_authors (book_id, author_id) VALUES
(5, 2),(9, 10),(16, 1),(20, 2),(25, 1);

-- Relación libro-categorías
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1),(1, 3),(2, 1),(3, 2),(4, 3),(5, 4),(6, 5),(7, 1),(8, 5),(9, 2),
(10, 1),(11, 2),(12, 3),(13, 4),(14, 5),(15, 3),(16, 4),(17, 1),(18, 6),(19, 3),
(20, 4),(21, 5),(22, 5),(23, 6),(24, 4),(25, 1),(26, 5),(27, 4),(28, 5),(29, 2),(30, 3);

-- Ejemplares
INSERT INTO copies (book_id, barcode, status, copy_condition, acquired_at) VALUES
(1, 'CP-0001-01', 'available', 'good', NOW()),
(1, 'CP-0001-02', 'loaned', 'good', NOW() - INTERVAL 15 DAY),
(1, 'CP-0001-03', 'sold', 'good', NOW() - INTERVAL 45 DAY),
(1, 'CP-0001-04', 'available', 'good', NOW()),
(2, 'CP-0002-01', 'available', 'new', NOW()),
(2, 'CP-0002-02', 'available', 'good', NOW()),
(2, 'CP-0002-03', 'loaned', 'good', NOW() - INTERVAL 10 DAY),
(3, 'CP-0003-01', 'available', 'new', NOW()),
(3, 'CP-0003-02', 'available', 'good', NOW()),
(3, 'CP-0003-03', 'sold', 'good', NOW() - INTERVAL 30 DAY),
(4, 'CP-0004-01', 'available', 'good', NOW()),
(4, 'CP-0004-02', 'available', 'good', NOW()),
(4, 'CP-0004-03', 'loaned', 'good', NOW() - INTERVAL 25 DAY),
(5, 'CP-0005-01', 'available', 'new', NOW()),
(5, 'CP-0005-02', 'sold', 'good', NOW() - INTERVAL 60 DAY),
(5, 'CP-0005-03', 'available', 'good', NOW()),
(6, 'CP-0006-01', 'available', 'good', NOW()),
(6, 'CP-0006-02', 'reserved', 'good', NOW()),
(6, 'CP-0006-03', 'available', 'good', NOW()),
(7, 'CP-0007-01', 'available', 'good', NOW()),
(7, 'CP-0007-02', 'sold', 'good', NOW() - INTERVAL 20 DAY),
(7, 'CP-0007-03', 'available', 'good', NOW()),
(8, 'CP-0008-01', 'available', 'good', NOW()),
(8, 'CP-0008-02', 'available', 'good', NOW()),
(8, 'CP-0008-03', 'loaned', 'good', NOW() - INTERVAL 6 DAY),
(9, 'CP-0009-01', 'available', 'good', NOW()),
(9, 'CP-0009-02', 'available', 'good', NOW()),
(9, 'CP-0009-03', 'available', 'good', NOW()),
(10, 'CP-0010-01', 'sold', 'good', NOW() - INTERVAL 35 DAY),
(10, 'CP-0010-02', 'available', 'good', NOW()),
(10, 'CP-0010-03', 'available', 'good', NOW()),
(11, 'CP-0011-01', 'available', 'good', NOW()),
(11, 'CP-0011-02', 'available', 'good', NOW()),
(11, 'CP-0011-03', 'sold', 'good', NOW() - INTERVAL 12 DAY),
(12, 'CP-0012-01', 'available', 'good', NOW()),
(12, 'CP-0012-02', 'available', 'good', NOW()),
(12, 'CP-0012-03', 'available', 'good', NOW()),
(13, 'CP-0013-01', 'available', 'good', NOW()),
(13, 'CP-0013-02', 'reserved', 'good', NOW()),
(13, 'CP-0013-03', 'available', 'good', NOW()),
(14, 'CP-0014-01', 'loaned', 'good', NOW() - INTERVAL 7 DAY),
(14, 'CP-0014-02', 'available', 'good', NOW()),
(14, 'CP-0014-03', 'available', 'good', NOW()),
(15, 'CP-0015-01', 'available', 'good', NOW()),
(15, 'CP-0015-02', 'available', 'good', NOW()),
(16, 'CP-0016-01', 'available', 'good', NOW()),
(16, 'CP-0016-02', 'available', 'good', NOW()),
(16, 'CP-0016-03', 'sold', 'good', NOW() - INTERVAL 17 DAY),
(17, 'CP-0017-01', 'available', 'good', NOW()),
(17, 'CP-0017-02', 'available', 'good', NOW()),
(17, 'CP-0017-03', 'sold', 'good', NOW() - INTERVAL 22 DAY),
(18, 'CP-0018-01', 'available', 'good', NOW()),
(18, 'CP-0018-02', 'available', 'good', NOW()),
(19, 'CP-0019-01', 'loaned', 'good', NOW() - INTERVAL 18 DAY),
(19, 'CP-0019-02', 'available', 'good', NOW()),
(20, 'CP-0020-01', 'available', 'good', NOW()),
(20, 'CP-0020-02', 'available', 'good', NOW()),
(21, 'CP-0021-01', 'available', 'good', NOW()),
(21, 'CP-0021-02', 'available', 'good', NOW()),
(22, 'CP-0022-01', 'available', 'good', NOW()),
(22, 'CP-0022-02', 'available', 'good', NOW()),
(23, 'CP-0023-01', 'available', 'good', NOW()),
(23, 'CP-0023-02', 'available', 'good', NOW()),
(24, 'CP-0024-01', 'available', 'good', NOW()),
(24, 'CP-0024-02', 'available', 'good', NOW()),
(25, 'CP-0025-01', 'sold', 'good', NOW() - INTERVAL 40 DAY),
(25, 'CP-0025-02', 'available', 'good', NOW()),
(26, 'CP-0026-01', 'available', 'good', NOW()),
(26, 'CP-0026-02', 'available', 'good', NOW()),
(27, 'CP-0027-01', 'available', 'good', NOW()),
(27, 'CP-0027-02', 'available', 'good', NOW()),
(28, 'CP-0028-01', 'available', 'good', NOW()),
(28, 'CP-0028-02', 'available', 'good', NOW()),
(29, 'CP-0029-01', 'available', 'good', NOW()),
(29, 'CP-0029-02', 'available', 'good', NOW()),
(30, 'CP-0030-01', 'available', 'good', NOW()),
(30, 'CP-0030-02', 'available', 'good', NOW());

-- Usuarios normales y administradores
INSERT INTO users (first_name, last_name, email, password_hash, role_id, status) VALUES
('Valeria', 'González', 'valeria@example.com', '$2a$10$Dci1HmSoluBOiOy03C8.3ecQ60K2jhcp/gpQl6e2NibX.4Jr6FC6C', 1, 'active'),
('Admin', 'Central', 'admin@example.com', '$2a$10$J6gvNJupIwWAKveF7R0XVuIjcgASIxCwkZx.OxJeH5rsJlSC0o74O', 1, 'active'),
('Santiago', 'Pérez', 'santiago@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('María', 'Rodríguez', 'maria@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Lucas', 'Fernández', 'lucas@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Camila', 'García', 'camila@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Martín', 'Díaz', 'martin@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Lucía', 'Herrera', 'lucia@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Nicolás', 'Sosa', 'nicolas@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Florencia', 'Núñez', 'florencia@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Diego', 'Ramos', 'diego@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Sofía', 'Mendoza', 'sofia@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Andrés', 'López', 'andres@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Mónica', 'Blanco', 'monica@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Clara', 'Paz', 'clara@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Tomás', 'Bravo', 'tomas@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active'),
('Paula', 'Campos', 'paula@example.com', '$2a$10$uzv0Zi/TGS4usgHCZKgET.VarJtVHyrfr16.wn3VAKu9kzCdfhG/G', 2, 'active');

-- Historia de precios
INSERT INTO price_history (book_id, old_purchase_price, new_purchase_price, old_rental_price, new_rental_price, changed_by, changed_at, reason) VALUES
(1, 50.00, 55.00, 9.00, 10.00, 1, NOW() - INTERVAL 15 DAY, 'Ajuste de temporada'),
(5, 58.00, 60.00, 11.00, 11.50, 1, NOW() - INTERVAL 30 DAY, 'Actualización de catálogo'),
(16, 65.00, 68.00, 12.00, 13.00, 2, NOW() - INTERVAL 20 DAY, 'Nueva edición ampliada'),
(20, 60.00, 61.00, 11.50, 12.00, 2, NOW() - INTERVAL 18 DAY, 'Costo editorial actualizado');

-- Ventas realizadas
INSERT INTO sales (user_id, sale_date, total_amount, status, payment_method) VALUES
(3, NOW() - INTERVAL 12 DAY, 55.00, 'completed', 'tarjeta'),
(4, NOW() - INTERVAL 9 DAY, 48.00, 'completed', 'tarjeta'),
(5, NOW() - INTERVAL 5 DAY, 72.00, 'completed', 'tarjeta');

INSERT INTO sale_items (sale_id, book_id, quantity, unit_price) VALUES
(1, 1, 1, 55.00),
(2, 2, 1, 48.00),
(3, 3, 1, 72.00);

-- Préstamos activos y finalizados
INSERT INTO loans (user_id, loan_date, due_date, return_date, status, rental_fee) VALUES
(6, NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 2 DAY, NULL, 'active', 8.00),
(7, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 3 DAY, NULL, 'overdue', 9.00),
(8, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY, 'returned', 7.50);

INSERT INTO loan_items (loan_id, copy_id, book_id, quantity) VALUES
(1, 2, 1, 1),
(2, 14, 14, 1),
(3, 8, 8, 1);

UPDATE copies SET status = 'loaned' WHERE copy_id IN (2, 14);
UPDATE copies SET status = 'available' WHERE copy_id = 8;

-- Reseñas de libros
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES
(3, 1, 5, 'Una lectura perfecta para una tarde de verano. Muy recomendada.'),
(4, 2, 4, 'Buena trama urbana y personajes muy reales.'),
(5, 3, 5, 'Excelente libro científico: claro y ameno.'),
(6, 6, 5, 'Mi hija lo adoró, hermoso mensaje ecológico.'),
(7, 9, 4, 'Muy útil para entender los conceptos clave de la salud.');

-- Movimientos de stock de ejemplo
INSERT INTO stock_movements (book_id, copy_id, quantity, movement_type, movement_date, note) VALUES
(1, 2, 1, 'loan', NOW() - INTERVAL 8 DAY, 'Préstamo activo de ejemplo'),
(14, 14, 1, 'loan', NOW() - INTERVAL 18 DAY, 'Préstamo vencido de ejemplo'),
(1, NULL, 1, 'sale', NOW() - INTERVAL 12 DAY, 'Venta registrada en seed'),
(2, NULL, 1, 'sale', NOW() - INTERVAL 9 DAY, 'Venta registrada en seed'),
(3, NULL, 1, 'sale', NOW() - INTERVAL 5 DAY, 'Venta registrada en seed');

-- Notificaciones de ejemplo
INSERT INTO notifications (user_id, type, title, message, related_book_id, related_sale_id, related_loan_id, is_read, created_at) VALUES
(3, 'purchase', 'Compra confirmada', 'Has comprado el libro La casa del faro.', 1, 1, NULL, 0, NOW() - INTERVAL 12 DAY),
(4, 'purchase', 'Compra confirmada', 'Has comprado el libro Sombras de ciudad.', 2, 2, NULL, 1, NOW() - INTERVAL 9 DAY),
(6, 'loan', 'Prestamo registrado', 'Has alquilado el libro La casa del faro.', 1, NULL, 1, 0, NOW() - INTERVAL 8 DAY);

-- Reservas de ejemplo
INSERT INTO reservations (user_id, book_id, reserved_at, expires_at, status) VALUES
(9, 6, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, 'pending'),
(10, 13, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 1 DAY, 'pending'),
(11, 17, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY, 'expired'),
(12, 21, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 1 DAY, 'fulfilled');

-- Carritos de compra/alquiler de ejemplo
INSERT INTO carts (user_id, status, created_at, updated_at) VALUES
(3, 'open', NOW() - INTERVAL 1 DAY, NOW()),
(4, 'open', NOW() - INTERVAL 2 DAY, NOW()),
(5, 'submitted', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(6, 'discarded', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY);

INSERT INTO cart_items (cart_id, book_id, quantity, item_type) VALUES
(1, 4, 1, 'purchase'),
(1, 6, 1, 'rental'),
(2, 9, 1, 'purchase'),
(2, 20, 1, 'rental'),
(3, 3, 1, 'purchase'),
(4, 8, 1, 'rental');

