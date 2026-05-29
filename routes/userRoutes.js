const express = require("express");
const pool = require("../config/db");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
router.use(authenticate);

router.get("/me", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.created_at, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = ? LIMIT 1`,
      [userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar la información del usuario" });
  }
});

router.post("/purchases", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { book_id, quantity } = req.body;
    if (!book_id || !quantity || quantity < 1) {
      return res.status(400).json({ error: "Libro y cantidad son obligatorios" });
    }

    const [[book]] = await pool.query("SELECT book_id, purchase_price FROM books WHERE book_id = ? AND is_active = 1", [book_id]);
    if (!book) {
      return res.status(404).json({ error: "Libro no disponible para compra" });
    }

    const totalAmount = parseFloat(book.purchase_price) * quantity;
    const [saleResult] = await pool.query(
      "INSERT INTO sales (user_id, sale_date, total_amount, status, payment_method) VALUES (?, NOW(), ?, 'completed', 'tarjeta')",
      [userId, totalAmount]
    );

    await pool.query(
      "INSERT INTO sale_items (sale_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [saleResult.insertId, book_id, quantity, book.purchase_price]
    );

    await pool.query(
      `UPDATE copies SET status = 'sold' WHERE book_id = ? AND status = 'available' LIMIT ?`,
      [book_id, quantity]
    );

    await pool.query(
      "INSERT INTO stock_movements (book_id, quantity, movement_type, movement_date, note) VALUES (?, ?, 'sale', NOW(), 'Venta registrada desde el sitio web')",
      [book_id, quantity]
    );

    res.json({ message: "Compra registrada con éxito", sale_id: saleResult.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo procesar la compra" });
  }
});

router.post("/loans", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { book_id, days } = req.body;
    if (!book_id || !days || days < 1) {
      return res.status(400).json({ error: "Libro y días son obligatorios" });
    }

    const [[book]] = await pool.query("SELECT book_id, rental_price FROM books WHERE book_id = ? AND is_active = 1", [book_id]);
    if (!book) {
      return res.status(404).json({ error: "Libro no disponible para préstamo" });
    }

    const [availableCopies] = await pool.query("SELECT copy_id FROM copies WHERE book_id = ? AND status = 'available' LIMIT 1", [book_id]);
    if (!availableCopies.length) {
      return res.status(409).json({ error: "No hay ejemplares disponibles para préstamo" });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(days));

    const [loanResult] = await pool.query(
      "INSERT INTO loans (user_id, loan_date, due_date, status, rental_fee) VALUES (?, NOW(), ?, 'active', ?)",
      [userId, dueDate.toISOString().slice(0, 19).replace("T", " "), book.rental_price]
    );

    await pool.query(
      "INSERT INTO loan_items (loan_id, copy_id, book_id, quantity) VALUES (?, ?, ?, 1)",
      [loanResult.insertId, availableCopies[0].copy_id, book_id]
    );

    await pool.query("UPDATE copies SET status = 'loaned' WHERE copy_id = ?", [availableCopies[0].copy_id]);
    await pool.query(
      "INSERT INTO stock_movements (book_id, copy_id, quantity, movement_type, movement_date, note) VALUES (?, ?, 1, 'loan', NOW(), 'Préstamo registrado desde la web')",
      [book_id, availableCopies[0].copy_id]
    );

    res.json({ message: "Préstamo registrado con éxito", loan_id: loanResult.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo procesar el préstamo" });
  }
});

router.get("/purchases", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT s.sale_id, s.sale_date, s.total_amount, s.status, si.book_id, si.quantity, si.unit_price, b.title
       FROM sales s
       JOIN sale_items si ON s.sale_id = si.sale_id
       JOIN books b ON si.book_id = b.book_id
       WHERE s.user_id = ?
       ORDER BY s.sale_date DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las compras" });
  }
});

router.get("/loans", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;
    const conditions = ["l.user_id = ?"];
    const params = [userId];
    if (status === "active") {
      conditions.push("l.status = 'active'");
    }
    if (status === "history") {
      conditions.push("l.status IN ('returned','overdue')");
    }

    const [rows] = await pool.query(
      `SELECT l.loan_id, l.loan_date, l.due_date, l.return_date, l.status, l.rental_fee, li.book_id, b.title
       FROM loans l
       JOIN loan_items li ON l.loan_id = li.loan_id
       JOIN books b ON li.book_id = b.book_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY l.loan_date DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los préstamos" });
  }
});

module.exports = router;
