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

async function getRequest(req, res) {
    
  try {
    const request = await ContactRequest.findByPk(req.params.id, {
      include: [
        { model: ContactRequestImage, as: "images" },
        { model: ContactRequestEvent, as: "events" },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: "Demande introuvable." });
    }

    return res.status(200).json({ ok: true, request });
  } catch (error) {
    console.error("[admin] get failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger la demande." });
  }
}


const EDITABLE = [
  "phone",
  "phone_secondary",
  "address",
  "current_website",
  "budget",
  "status",
  "quote_amount",
  "approved_amount",
  "timeline",
  "follow_up_date",
  "notes",
];

async function updateRequest(req, res) {

  try {
    const request = await ContactRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Demande introuvable." });
    }

    const updates = {};
    for (const field of EDITABLE) {
      if (field in req.body) updates[field] = req.body[field];
    }

    await request.update(updates);
    const fresh = await ContactRequest.findByPk(request.id, {
      include: [
        { model: ContactRequestImage, as: "images" },
        { model: ContactRequestEvent, as: "events" },
      ],
    });

    return res.status(200).json({ ok: true, request: fresh });
  } catch (error) {
    console.error("[admin] update failed:", error.message);
    return res.status(500).json({ error: "Mise à jour impossible." });
  }
}

export default { listRequests, getRequest, updateRequest };