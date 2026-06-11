require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

function redactSensitiveText(message = "") {
  let safeMessage = String(message);
  const sensitiveValues = [
    process.env.DB_PASSWORD,
    process.env.JWT_SECRET,
    process.env.DB_SSL_CA_CONTENT
  ].filter(Boolean);

  for (const value of sensitiveValues) {
    safeMessage = safeMessage.split(value).join("[redacted]");
  }

  return safeMessage;
}

const dbConfigStatus = pool.getDatabaseConfigStatus();
console.log("Configuracion del entorno:", {
  node_env: process.env.NODE_ENV || "development",
  db_host_configured: dbConfigStatus.db_host_configured,
  db_port_configured: dbConfigStatus.db_port_configured,
  db_user_configured: dbConfigStatus.db_user_configured,
  db_name_configured: dbConfigStatus.db_name_configured,
  ssl_configured: dbConfigStatus.ssl_configured,
  jwt_secret_configured: Boolean(process.env.JWT_SECRET)
});

app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, "public");
const assetsPath = path.join(__dirname, "assets");

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath, { dotfiles: "deny" }));
}

if (fs.existsSync(assetsPath)) {
  app.use("/assets", express.static(assetsPath, { dotfiles: "deny" }));
}

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "API de Biblioteca Digital activa"
  });
});

app.get("/api/health/env", (req, res) => {
  const status = pool.getDatabaseConfigStatus();
  const missing = [...status.missing];

  if (!process.env.JWT_SECRET) {
    missing.push("JWT_SECRET");
  }

  res.json({
    ok: missing.length === 0,
    node_env: process.env.NODE_ENV || "development",
    db_host_configured: status.db_host_configured,
    db_name_configured: status.db_name_configured,
    ssl_configured: status.ssl_configured,
    jwt_secret_configured: Boolean(process.env.JWT_SECRET),
    missing_required: missing
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS database_name");
    res.json({ ok: true, database: rows[0]?.database_name || null });
  } catch (error) {
    const detail = redactSensitiveText(error.message);
    console.error("Error en /api/health/db:", detail);
    res.status(500).json({
      ok: false,
      error: "No se pudo conectar a la base de datos",
      detail
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get(["/mi-cuenta", "/recomendados"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/:file", (req, res, next) => {
  const allowedFiles = new Set(["index.html", "styles.css", "script.js"]);

  if (!allowedFiles.has(req.params.file)) {
    return next();
  }

  return res.sendFile(path.join(__dirname, req.params.file));
});

app.use((err, req, res, next) => {
  console.error("Error interno:", redactSensitiveText(err.message));
  res.status(500).json({ error: "Error interno en el servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
});
