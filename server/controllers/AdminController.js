import { ContactRequest, ContactRequestImage, ContactRequestEvent } from "../models/index.js";

async function listRequests(req, res) {
  try {
    const requests = await ContactRequest.findAll({
      include: [
        { model: ContactRequestImage, as: "images" },
        { model: ContactRequestEvent, as: "events" },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ ok: true, requests });
  } catch (error) {
    console.error("[admin] list failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger les demandes." });
  }
}

export default { listRequests };