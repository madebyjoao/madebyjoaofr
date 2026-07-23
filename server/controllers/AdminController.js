import { ContactRequest, ContactRequestImage, ContactRequestEvent } from "../models/index.js";
import { fileTypeFromBuffer } from "file-type";
import { writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";

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

async function addImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu." });
  }

  const detected = await fileTypeFromBuffer(req.file.buffer);
  const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!detected || !allowed.includes(detected.mime)) {
    return res.status(400).json({ error: "Format non accepté (PNG, JPG, WEBP ou PDF)." });
  }

  try {
    const request = await ContactRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: "Demande introuvable." });

    const filename = `${randomUUID()}.${detected.ext}`;
    const diskPath = `uploads/${filename}`;
    await writeFile(diskPath, req.file.buffer);

    const image = await ContactRequestImage.create({
      contact_request_id: request.id,
      path: diskPath,
      original_name: req.file.originalname,
      source: "admin",
    });

    return res.status(201).json({ ok: true, image });
  } catch (error) {
    console.error("[admin] add image failed:", error.message);
    return res.status(500).json({ error: "Ajout du fichier impossible." });
  }
}

async function deleteImage(req, res) {
  try {
    // scoped to the request id — you can't delete another lead's file by guessing an id
    const image = await ContactRequestImage.findOne({
      where: { id: req.params.imageId, contact_request_id: req.params.id },
    });
    if (!image) return res.status(404).json({ error: "Fichier introuvable." });

    // remove the file, but don't fail the delete if it's already gone
    await unlink(image.path).catch(() => {});
    await image.destroy();

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin] delete image failed:", error.message);
    return res.status(500).json({ error: "Suppression impossible." });
  }
}

export default { listRequests, getRequest, updateRequest, addImage, deleteImage };
