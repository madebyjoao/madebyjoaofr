import express from "express";
import sequelize from "./db.js";
import router from "./routes/index.js";

const app = express();

app.use(express.json()); 
app.use("/", router);                    

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "le serveur est vivant" });
});

try {
  await sequelize.authenticate();
  console.log("DB connectée ✓");
} catch (error) {
  console.log("DB erreur ✗ :", error.message);
}

app.listen(3000, () => {
  console.log("serveur → http://localhost:3000");
});