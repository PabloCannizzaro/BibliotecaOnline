const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME"
];

let pool;

function getMissingDatabaseConfig() {
  const missing = requiredEnvVars.filter((name) => !process.env[name]);

  if (!process.env.DB_SSL_CA_CONTENT && !process.env.DB_SSL_CA) {
    missing.push("DB_SSL_CA or DB_SSL_CA_CONTENT");
  }

  return missing;
}

function getDatabaseConfigStatus() {
  const missing = getMissingDatabaseConfig();

  return {
    ok: missing.length === 0,
    missing,
    db_host_configured: Boolean(process.env.DB_HOST),
    db_port_configured: Boolean(process.env.DB_PORT),
    db_user_configured: Boolean(process.env.DB_USER),
    db_name_configured: Boolean(process.env.DB_NAME),
    ssl_configured: Boolean(process.env.DB_SSL_CA_CONTENT || process.env.DB_SSL_CA)
  };
}

function getSslCa() {
  if (process.env.DB_SSL_CA_CONTENT) {
    return process.env.DB_SSL_CA_CONTENT.replace(/\\n/g, "\n");
  }

  const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA);

  try {
    return fs.readFileSync(caPath, "utf8");
  } catch (err) {
    throw new Error(`No se pudo leer el certificado DB_SSL_CA en ${caPath}: ${err.message}`);
  }
}

function createPool() {
  const missing = getMissingDatabaseConfig();

  if (missing.length) {
    throw new Error(`Faltan variables de entorno requeridas para la base de datos: ${missing.join(", ")}`);
  }

  const port = Number(process.env.DB_PORT);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("DB_PORT debe ser un numero entero valido");
  }

  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00",
    ssl: {
      ca: getSslCa(),
      rejectUnauthorized: true
    }
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}

module.exports = {
  async query(...args) {
    return getPool().query(...args);
  },
  async execute(...args) {
    return getPool().execute(...args);
  },
  async getConnection() {
    return getPool().getConnection();
  },
  end() {
    return pool ? pool.end() : Promise.resolve();
  },
  getPool,
  getDatabaseConfigStatus
};
