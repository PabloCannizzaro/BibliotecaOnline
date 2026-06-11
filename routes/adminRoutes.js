const express = require("express");
const pool = require("../config/db");
const { authenticate, requireAdmin } = require("../middlewares/auth");

const router = express.Router();
router.use(authenticate, requireAdmin);

async function getAdminStats() {
  const [[stats]] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM books) AS total_books,
      (SELECT COUNT(*) FROM books WHERE is_active = 1) AS active_books,
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE status = 'active' AND role_id != 1) AS active_users,
      (SELECT COUNT(*) FROM copies WHERE status = 'available') AS available_copies,
      (SELECT COUNT(*) FROM loans WHERE status = 'active') AS active_loans,
      (SELECT COUNT(*) FROM loans WHERE status = 'overdue') AS overdue_loans,
      (SELECT COUNT(*) FROM sales WHERE status = 'completed') AS completed_sales,
      (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE status = 'completed') AS total_sold,
      (
        SELECT COUNT(*) FROM (
          SELECT b.book_id
          FROM books b
          LEFT JOIN copies cp ON b.book_id = cp.book_id AND cp.status = 'available'
          WHERE b.is_active = 1
          GROUP BY b.book_id, b.stock_minimum
          HAVING COUNT(cp.copy_id) <= b.stock_minimum
        ) low_stock_books
      ) AS low_stock_books`
  );

  return stats;
}

router.get("/stats", async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las estadísticas administrativas" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el dashboard administrativo" });
  }
});

router.get("/books", async (req, res) => {
  try {
    const [books] = await pool.query(
      `SELECT b.book_id, b.title, b.description, b.publisher_id, b.publication_year,
        b.purchase_price, b.rental_price, b.stock_minimum, b.is_active, p.name AS publisher_name,
        COALESCE(SUM(cp.status = 'available'), 0) AS available_copies,
        COALESCE(SUM(cp.status = 'loaned'), 0) AS loaned,
        COALESCE(SUM(cp.status = 'sold'), 0) AS sold
       FROM books b
       LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
       LEFT JOIN copies cp ON b.book_id = cp.book_id
       GROUP BY b.book_id, b.title, b.description, b.publisher_id, b.publication_year,
        b.purchase_price, b.rental_price, b.stock_minimum, b.is_active, p.name
       ORDER BY b.title`
    );
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los libros" });
  }
});

router.get("/books/low-stock", async (req, res) => {
  try {
    const [books] = await pool.query(
      `SELECT b.book_id, b.title, b.stock_minimum, b.is_active,
        COALESCE(SUM(cp.status = 'available'), 0) AS available_copies
       FROM books b
       LEFT JOIN copies cp ON b.book_id = cp.book_id
       WHERE b.is_active = 1
       GROUP BY b.book_id, b.title, b.stock_minimum, b.is_active
       HAVING available_copies <= b.stock_minimum
       ORDER BY available_copies ASC, b.title
       LIMIT 20`
    );
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los libros con bajo stock" });
  }
});

router.post("/books", async (req, res) => {
  try {
    const { title, description, publisher_id, publication_year, purchase_price, rental_price, category_ids, author_ids } = req.body;
    if (!title || !purchase_price || !rental_price || !publisher_id) {
      return res.status(400).json({ error: "Datos básicos del libro son obligatorios" });
    }

    const [result] = await pool.query(
      `INSERT INTO books (title, description, publisher_id, publication_year, purchase_price, rental_price, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [title, description || "", publisher_id, publication_year || null, purchase_price, rental_price]
    );
    const bookId = result.insertId;

    if (Array.isArray(category_ids)) {
      for (const categoryId of category_ids) {
        await pool.query("INSERT IGNORE INTO book_categories (book_id, category_id) VALUES (?, ?)", [bookId, categoryId]);
      }
    }
    if (Array.isArray(author_ids)) {
      for (const authorId of author_ids) {
        await pool.query("INSERT IGNORE INTO book_authors (book_id, author_id) VALUES (?, ?)", [bookId, authorId]);
      }
    }

    res.json({ message: "Libro creado con éxito", book_id: bookId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo crear el libro" });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const { title, description, publisher_id, publication_year, purchase_price, rental_price, is_active } = req.body;

    await pool.query(
      `UPDATE books SET title = ?, description = ?, publisher_id = ?, publication_year = ?, purchase_price = ?, rental_price = ?, is_active = ?, updated_at = NOW()
       WHERE book_id = ?`,
      [title, description || "", publisher_id, publication_year || null, purchase_price, rental_price, is_active ? 1 : 0, bookId]
    );

    res.json({ message: "Libro actualizado con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo actualizar el libro" });
  }
});

router.patch("/books/:id/status", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const isActive = req.body.is_active ? 1 : 0;

    const [result] = await pool.query(
      "UPDATE books SET is_active = ?, updated_at = NOW() WHERE book_id = ?",
      [isActive, bookId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    res.json({ message: isActive ? "Libro activado" : "Libro desactivado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cambiar el estado del libro" });
  }
});

router.post("/books/:id/prices", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const { purchase_price, rental_price, reason } = req.body;
    const [bookRows] = await pool.query("SELECT purchase_price, rental_price FROM books WHERE book_id = ? LIMIT 1", [bookId]);
    const book = bookRows[0];
    if (!book) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const now = new Date();
    await pool.query(
      `INSERT INTO price_history (book_id, old_purchase_price, new_purchase_price, old_rental_price, new_rental_price, changed_by, changed_at, reason)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [bookId, book.purchase_price, purchase_price, book.rental_price, rental_price, req.user.user_id, reason || 'Actualización administrativa']
    );

    await pool.query(
      `UPDATE books SET purchase_price = ?, rental_price = ?, updated_at = NOW() WHERE book_id = ?`,
      [purchase_price, rental_price, bookId]
    );

    res.json({ message: "Precio actualizado y registrado en historial" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo actualizar el precio" });
  }
});

router.post("/books/:id/copies", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const { quantity, status, condition, copy_condition } = req.body;
    const allowedStatuses = new Set(["available", "loaned", "reserved", "sold", "damaged", "inactive"]);
    const allowedConditions = new Set(["new", "good", "used", "damaged"]);
    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      return res.status(400).json({ error: "Cantidad de ejemplares debe ser mayor a cero" });
    }

    const copyStatus = allowedStatuses.has(status) ? status : "available";
    const requestedCondition = copy_condition || condition;
    const copyCondition = allowedConditions.has(requestedCondition) ? requestedCondition : "good";

    for (let i = 0; i < qty; i += 1) {
      await pool.query(
        "INSERT INTO copies (book_id, barcode, status, copy_condition, acquired_at) VALUES (?, UUID(), ?, ?, NOW())",
        [bookId, copyStatus, copyCondition]
      );
    }

    await pool.query(
      "INSERT INTO stock_movements (book_id, quantity, movement_type, movement_date, note) VALUES (?, ?, 'stock-in', NOW(), 'Ingreso de ejemplares por admin')",
      [bookId, qty]
    );

    res.json({ message: `Se agregaron ${qty} ejemplares al libro`, book_id: bookId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo agregar stock" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, r.role_name, u.status, u.created_at
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los usuarios" });
  }
});

router.get("/sales", async (req, res) => {
  try {
    const [sales] = await pool.query(
      `SELECT s.sale_id, s.sale_date, s.total_amount, s.status, s.payment_method,
        s.card_last4, s.payment_reference, u.first_name, u.last_name
       FROM sales s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.sale_date DESC`
    );
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las ventas" });
  }
});

router.get("/loans/active", async (req, res) => {
  try {
    const [loans] = await pool.query(
      `SELECT l.loan_id, l.loan_date, l.due_date, l.status, u.first_name, u.last_name, b.title
       FROM loans l
       JOIN users u ON l.user_id = u.user_id
       JOIN loan_items li ON l.loan_id = li.loan_id
       JOIN books b ON li.book_id = b.book_id
       WHERE l.status = 'active'
       ORDER BY l.due_date ASC`
    );
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los préstamos activos" });
  }
});

router.get("/loans/overdue", async (req, res) => {
  try {
    const [loans] = await pool.query(
      `SELECT l.loan_id, l.loan_date, l.due_date, l.status, u.first_name, u.last_name, b.title
       FROM loans l
       JOIN users u ON l.user_id = u.user_id
       JOIN loan_items li ON l.loan_id = li.loan_id
       JOIN books b ON li.book_id = b.book_id
       WHERE l.status = 'overdue'
       ORDER BY l.due_date ASC`
    );
    res.json(loans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los préstamos vencidos" });
  }
});

router.get("/price-history", async (req, res) => {
  try {
    const [history] = await pool.query(
      `SELECT ph.price_history_id, ph.changed_at, ph.old_purchase_price, ph.new_purchase_price,
        ph.old_rental_price, ph.new_rental_price, ph.reason, b.title, u.first_name, u.last_name
       FROM price_history ph
       JOIN books b ON ph.book_id = b.book_id
       JOIN users u ON ph.changed_by = u.user_id
       ORDER BY ph.changed_at DESC
       LIMIT 50`
    );
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el historial de precios" });
  }
});

module.exports = router;
