const express = require("express");
const pool = require("../config/db");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();
router.use(authenticate);

function onlyDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function passesLuhn(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function parseExpiration(value = "") {
  const match = String(value).trim().match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2].length === 2 ? `20${match[2]}` : match[2]);

  if (month < 1 || month > 12) return null;

  return { month, year };
}

function validateCardPayment(payment = {}) {
  const errors = {};
  const cardNumber = onlyDigits(payment.card_number);
  const cardHolder = String(payment.card_holder || "").trim();
  const expiration = parseExpiration(payment.expiration);
  const cvv = onlyDigits(payment.cvv);

  if (!/^\d{13,19}$/.test(cardNumber) || !passesLuhn(cardNumber)) {
    errors.card_number = "El numero de tarjeta no es valido";
  }

  if (cardHolder.length < 3 || !/[a-zA-Z]/.test(cardHolder)) {
    errors.card_holder = "Ingresa el nombre del titular";
  }

  if (!expiration) {
    errors.expiration = "Usa el formato MM/AA";
  } else {
    const now = new Date();
    const expiresAt = new Date(expiration.year, expiration.month, 0, 23, 59, 59);
    if (expiresAt < now) {
      errors.expiration = "La tarjeta esta vencida";
    }
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    errors.cvv = "El codigo de seguridad debe tener 3 o 4 digitos";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    cardLast4: cardNumber.slice(-4),
    cardHolder
  };
}

function createPaymentReference() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PAY-${Date.now()}-${randomPart}`;
}

async function createNotification(connection, { userId, type, title, message, bookId = null, saleId = null, loanId = null }) {
  await connection.query(
    `INSERT INTO notifications
      (user_id, type, title, message, related_book_id, related_sale_id, related_loan_id, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, message, bookId, saleId, loanId]
  );
}

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
    res.status(500).json({ error: "No se pudo cargar la informacion del usuario" });
  }
});

router.post("/purchases", async (req, res) => {
  let connection;

  try {
    const userId = req.user.user_id;
    const { book_id, quantity, payment } = req.body;
    const qty = Number(quantity);
    const paymentValidation = validateCardPayment(payment);

    if (!book_id || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: "Libro y cantidad son obligatorios" });
    }

    if (!paymentValidation.ok) {
      return res.status(400).json({
        error: "Revisa los datos de la tarjeta",
        field_errors: paymentValidation.errors
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[book]] = await connection.query(
      "SELECT book_id, title, purchase_price FROM books WHERE book_id = ? AND is_active = 1 LIMIT 1 FOR UPDATE",
      [book_id]
    );

    if (!book) {
      await connection.rollback();
      return res.status(404).json({ error: "Libro no disponible para compra" });
    }

    const [availableCopies] = await connection.query(
      "SELECT copy_id FROM copies WHERE book_id = ? AND status = 'available' ORDER BY copy_id LIMIT ? FOR UPDATE",
      [book_id, qty]
    );

    if (availableCopies.length < qty) {
      await connection.rollback();
      return res.status(409).json({ error: "No hay ejemplares suficientes para completar la compra" });
    }

    const totalAmount = parseFloat(book.purchase_price) * qty;
    const paymentReference = createPaymentReference();
    const [saleResult] = await connection.query(
      `INSERT INTO sales
        (user_id, sale_date, total_amount, status, payment_method, card_holder, card_last4, payment_reference)
       VALUES (?, NOW(), ?, 'completed', 'tarjeta', ?, ?, ?)`,
      [userId, totalAmount, paymentValidation.cardHolder, paymentValidation.cardLast4, paymentReference]
    );

    await connection.query(
      "INSERT INTO sale_items (sale_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [saleResult.insertId, book_id, qty, book.purchase_price]
    );

    const copyIds = availableCopies.map(copy => copy.copy_id);
    const placeholders = copyIds.map(() => "?").join(", ");
    await connection.query(
      `UPDATE copies SET status = 'sold' WHERE copy_id IN (${placeholders})`,
      copyIds
    );

    await connection.query(
      "INSERT INTO stock_movements (book_id, quantity, movement_type, movement_date, note) VALUES (?, ?, 'sale', NOW(), 'Venta registrada desde el sitio web')",
      [book_id, qty]
    );

    await createNotification(connection, {
      userId,
      type: "purchase",
      title: "Compra confirmada",
      message: `Has comprado el libro ${book.title}.`,
      bookId: book.book_id,
      saleId: saleResult.insertId
    });

    await connection.commit();

    res.json({
      message: "Compra registrada con exito",
      sale_id: saleResult.insertId,
      payment_reference: paymentReference
    });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error al revertir compra:", rollbackErr.message);
      }
    }

    console.error(err);
    res.status(500).json({ error: "No se pudo procesar la compra" });
  } finally {
    if (connection) connection.release();
  }
});

router.post("/loans", async (req, res) => {
  let connection;

  try {
    const userId = req.user.user_id;
    const { book_id, days } = req.body;
    const loanDays = Number(days);

    if (!book_id || !Number.isInteger(loanDays) || loanDays < 1) {
      return res.status(400).json({ error: "Libro y dias son obligatorios" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [[book]] = await connection.query(
      "SELECT book_id, title, rental_price FROM books WHERE book_id = ? AND is_active = 1 LIMIT 1 FOR UPDATE",
      [book_id]
    );

    if (!book) {
      await connection.rollback();
      return res.status(404).json({ error: "Libro no disponible para prestamo" });
    }

    const [availableCopies] = await connection.query(
      "SELECT copy_id FROM copies WHERE book_id = ? AND status = 'available' ORDER BY copy_id LIMIT 1 FOR UPDATE",
      [book_id]
    );

    if (!availableCopies.length) {
      await connection.rollback();
      return res.status(409).json({ error: "No hay ejemplares disponibles para prestamo" });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanDays);

    const [loanResult] = await connection.query(
      "INSERT INTO loans (user_id, loan_date, due_date, status, rental_fee) VALUES (?, NOW(), ?, 'active', ?)",
      [userId, dueDate.toISOString().slice(0, 19).replace("T", " "), book.rental_price]
    );

    await connection.query(
      "INSERT INTO loan_items (loan_id, copy_id, book_id, quantity) VALUES (?, ?, ?, 1)",
      [loanResult.insertId, availableCopies[0].copy_id, book_id]
    );

    await connection.query("UPDATE copies SET status = 'loaned' WHERE copy_id = ?", [availableCopies[0].copy_id]);
    await connection.query(
      "INSERT INTO stock_movements (book_id, copy_id, quantity, movement_type, movement_date, note) VALUES (?, ?, 1, 'loan', NOW(), 'Prestamo registrado desde la web')",
      [book_id, availableCopies[0].copy_id]
    );

    await createNotification(connection, {
      userId,
      type: "loan",
      title: "Prestamo registrado",
      message: `Has alquilado el libro ${book.title}.`,
      bookId: book.book_id,
      loanId: loanResult.insertId
    });

    await connection.commit();

    res.json({ message: "Prestamo registrado con exito", loan_id: loanResult.insertId });
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error al revertir prestamo:", rollbackErr.message);
      }
    }

    console.error(err);
    res.status(500).json({ error: "No se pudo procesar el prestamo" });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/purchases", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      `SELECT s.sale_id, s.sale_date, s.total_amount, s.status, s.payment_method, s.card_last4,
        s.payment_reference, si.book_id, si.quantity, si.unit_price, b.title
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
      conditions.push("l.status IN ('returned','overdue','cancelled')");
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
    res.status(500).json({ error: "No se pudieron cargar los prestamos" });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [notifications] = await pool.query(
      `SELECT notification_id, type, title, message, related_book_id, related_sale_id,
        related_loan_id, is_read, created_at, read_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY is_read ASC, created_at DESC
       LIMIT 30`,
      [userId]
    );
    const [[countRow]] = await pool.query(
      "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId]
    );

    res.json({
      unread_count: Number(countRow?.unread_count || 0),
      notifications
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las notificaciones" });
  }
});

router.patch("/notifications/read", async (req, res) => {
  try {
    const userId = req.user.user_id;
    await pool.query(
      "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    res.json({ message: "Notificaciones marcadas como leidas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron actualizar las notificaciones" });
  }
});

module.exports = router;
