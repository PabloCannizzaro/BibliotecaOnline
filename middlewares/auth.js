const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET no esta configurado");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no provisto" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch (err) {
    if (err.statusCode === 500) {
      return res.status(500).json({ error: "JWT_SECRET no esta configurado en el servidor" });
    }

    return res.status(401).json({ error: "Token invalido" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Se requiere permiso de administrador" });
  }
  return next();
};

module.exports = { authenticate, requireAdmin, getJwtSecret };
