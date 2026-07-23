import jwt from "jsonwebtoken";

export default function AuthMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");
  const [prefix, token] = authHeader?.split(" ") || [null, undefined];

  if (prefix !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.admin) {
      return res.status(403).json({ error: "Accès refusé." });
    }

    req.admin = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}