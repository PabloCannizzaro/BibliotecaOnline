# DER de la base de datos Biblioteca Digital

## Entidades principales

- roles: define los tipos de usuarios del sistema (admin, user).
- users: contiene los usuarios registrados, con su rol y estado.
- authors: almacena la información de los autores.
- publishers: editorial o casa publicadora de los libros.
- categories: tipos temáticos para clasificar los libros.
- books: referencia de los libros disponibles en la biblioteca.
- book_authors: entidad de relación muchos a muchos entre libros y autores.
- book_categories: entidad de relación muchos a muchos entre libros y categorías.
- copies: ejemplares físicos o digitales de cada libro, con su estado.
- price_history: registra los cambios de precio de compra y alquiler.
- sales: representa una venta realizada por un usuario.
- sale_items: detalle de los libros vendidos en cada venta.
- loans: representa un préstamo/alquiler asociado a un usuario.
- loan_items: detalle de los ejemplares prestados en cada préstamo.
- reviews: reseñas que los usuarios dejan sobre los libros.
- stock_movements: auditoría de cambios de stock por ventas, préstamos o ajustes.
- reservations: reservas de libros realizadas por usuarios.
- carts: carrito de compras de cada usuario.
- cart_items: detalle de artículos en el carrito.
- notifications: notificaciones persistentes para compras, prestamos y mensajes del sistema.

## Relaciones entre entidades

- users.role_id -> roles.role_id
- books.publisher_id -> publishers.publisher_id
- book_authors.book_id -> books.book_id
- book_authors.author_id -> authors.author_id
- book_categories.book_id -> books.book_id
- book_categories.category_id -> categories.category_id
- copies.book_id -> books.book_id
- price_history.book_id -> books.book_id
- price_history.changed_by -> users.user_id
- sales.user_id -> users.user_id
- sale_items.sale_id -> sales.sale_id
- sale_items.book_id -> books.book_id
- loans.user_id -> users.user_id
- loan_items.loan_id -> loans.loan_id
- loan_items.copy_id -> copies.copy_id
- loan_items.book_id -> books.book_id
- reviews.user_id -> users.user_id
- reviews.book_id -> books.book_id
- stock_movements.book_id -> books.book_id
- stock_movements.copy_id -> copies.copy_id
- reservations.user_id -> users.user_id
- reservations.book_id -> books.book_id
- carts.user_id -> users.user_id
- cart_items.cart_id -> carts.cart_id
- cart_items.book_id -> books.book_id
- notifications.user_id -> users.user_id
- notifications.related_book_id -> books.book_id
- notifications.related_sale_id -> sales.sale_id
- notifications.related_loan_id -> loans.loan_id

## Cardinalidades

- Un rol puede pertenecer a muchos usuarios.
- Un usuario tiene un solo rol y puede tener muchas ventas, préstamos, reseñas, reservas y carritos.
- Un libro puede tener múltiples autores y pertenecer a múltiples categorías.
- Un libro puede tener muchos ejemplares (copies).
- Un libro puede tener múltiples entradas en historial de precios.
- Una venta puede contener múltiples items y cada item apunta a un solo libro.
- Un préstamo puede contener múltiples ejemplares prestados.
- Un usuario puede tener múltiples préstamos y ventas.
- Un ejemplar solo pertenece a un libro.
- Una notificacion pertenece a un usuario y puede referenciar opcionalmente un libro, una venta o un prestamo.

## Claves primarias y foráneas

- Cada tabla principal usa un identificador entero auto incremental: role_id, user_id, author_id, publisher_id, category_id, book_id, copy_id, price_history_id, sale_id, sale_item_id, loan_id, loan_item_id, review_id, movement_id, reservation_id, cart_id, cart_item_id, notification_id.
- Las tablas de relación book_authors y book_categories usan claves primarias compuestas para garantizar unicidad y evitar duplicados.
- Las foráneas mantienen la integridad referencial, por ejemplo copies.book_id referencia books.book_id y no permite eliminar un libro con ejemplares dependientes sin ajustar antes.

## Normalización

La base está diseñada para cumplir con una normalización apropiada:

- 1FN: cada columna contiene valores atómicos; no hay listas o múltiples valores en una sola celda.
- 2FN: las tablas con claves primarias compuestas (book_authors, book_categories) no contienen dependencias parciales fuera de la clave.
- 3FN: la información repetida está extraída en tablas separadas (autores, editoriales, categorías, roles). Los cambios de precio quedan en price_history y no en el registro principal de libros.
- Las tablas de transacciones (sales, loans) están separadas de los detalles (sale_items, loan_items), lo que permite almacenar múltiples productos o ejemplares por transacción sin repetir datos.

## Justificación

- La separación entre books y copies permite rastrear disponibilidad y estados individuales por ejemplar.
- price_history asegura auditoría de cambios de precio y obliga a registrar nuevos valores cuando se actualiza un libro.
- sales y loans diferencian claramente compras de alquileres, y su detalle permite estadísticas como libros más vendidos o más prestados.
- El uso de roles y estados activos/inactivos permite respetar la regla de no eliminar información histórica importante.
