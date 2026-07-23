import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }


  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }


  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }


  const token = jwt.sign(
    { admin: true, email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.status(200).json({ ok: true, token });
}

export default { login };