import jwt from "jsonwebtoken";

export default function CheckUploadToken(req, res, next) {
  const authHeader = req.header("Authorization");
  const [prefix, token] = authHeader?.split(" ") || [null, undefined];

  if (prefix !== "Bearer" || !token) {
    return res.status(401).json({ error: "Jeton d'upload manquant." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // stash the request id from the token so the controller knows which
    // contact_request this file belongs to
    req.requestId = decoded.requestId;
    return next();
  } catch (error) {
    // covers expired (>15min) AND tampered/invalid tokens
    return res.status(401).json({ error: "Jeton invalide ou expiré." });
  }
}