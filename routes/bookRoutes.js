const express = require("express");
const pool = require("../config/db");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const [categories] = await pool.query("SELECT category_id, name, description FROM categories ORDER BY name");
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las categorías" });
  }
});

router.get("/authors", async (req, res) => {
  try {
    const [authors] = await pool.query("SELECT author_id, name FROM authors ORDER BY name");
    res.json(authors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar los autores" });
  }
});

router.get("/publishers", async (req, res) => {
  try {
    const [publishers] = await pool.query("SELECT publisher_id, name FROM publishers ORDER BY name");
    res.json(publishers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudieron cargar las editoriales" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const conditions = ["b.is_active = 1"];
    const params = [];

    if (search) {
      conditions.push("(b.title LIKE ? OR a.name LIKE ? OR c.name LIKE ?)");
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (category) {
      conditions.push("c.category_id = ?");
      params.push(category);
    }

    const query = `
      SELECT DISTINCT b.book_id, b.title, b.description, b.purchase_price, b.rental_price,
        p.name AS publisher_name,
        GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS authors,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories,
        COALESCE(SUM(CASE WHEN cp.status = 'available' THEN 1 ELSE 0 END), 0) AS available_copies
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN book_authors ba ON b.book_id = ba.book_id
      LEFT JOIN authors a ON ba.author_id = a.author_id
      LEFT JOIN book_categories bc ON b.book_id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.category_id
      LEFT JOIN copies cp ON b.book_id = cp.book_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY b.book_id, b.title, b.description, b.purchase_price, b.rental_price, p.name
      ORDER BY b.title
    `;

    const [books] = await pool.query(query, params);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el catálogo" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const [[book]] = await pool.query(
      `SELECT b.book_id, b.title, b.description, b.purchase_price, b.rental_price, b.publication_year,
        b.is_active, b.stock_minimum, p.name AS publisher_name
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      WHERE b.book_id = ? LIMIT 1`,
      [bookId]
    );

    if (!book) {
      return res.status(404).json({ error: "Libro no encontrado" });
    }

    const [authors] = await pool.query(
      `SELECT a.author_id, a.name FROM authors a
       JOIN book_authors ba ON a.author_id = ba.author_id
       WHERE ba.book_id = ?`,
      [bookId]
    );
    const [categories] = await pool.query(
      `SELECT c.category_id, c.name FROM categories c
       JOIN book_categories bc ON c.category_id = bc.category_id
       WHERE bc.book_id = ?`,
      [bookId]
    );
    const [[availability]] = await pool.query(
      `SELECT
        SUM(status = 'available') AS available,
        SUM(status = 'loaned') AS loaned,
        SUM(status = 'reserved') AS reserved,
        SUM(status = 'sold') AS sold,
        SUM(status = 'damaged') AS damaged
      FROM copies WHERE book_id = ?`,
      [bookId]
    );
    const [reviews] = await pool.query(
      `SELECT r.review_id, r.rating, r.comment, r.created_at, u.first_name, u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        WHERE r.book_id = ?
        ORDER BY r.created_at DESC
        LIMIT 10`,
      [bookId]
    );

    res.json({ book, authors, categories, availability, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el detalle del libro" });
  }
});

router.post("/:id/reviews", authenticate, async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user.user_id;

    if (!rating || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ error: "Calificación y comentario son obligatorios" });
    }

    await pool.query(
      "INSERT INTO reviews (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, bookId, rating, comment]
    );

    res.json({ message: "Reseña agregada con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo enviar la reseña" });
  }
});

module.exports = router;
