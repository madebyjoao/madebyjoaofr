import { writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { Project, ProjectImage } from "../models/index.js";

// "Restaurant Le Sud" → "restaurant-le-sud"
function slugify(text) {
  return text
    .normalize("NFD")                  // split accented chars into base + accent
    .replace(/[\u0300-\u036f]/g, "")   // drop the accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")       // anything not alphanumeric becomes a dash
    .replace(/^-+|-+$/g, "");          // trim leading/trailing dashes
}

// append -2, -3… until the slug is free
async function uniqueSlug(base, ignoreId = null) {
  let slug = base || "projet";
  let n = 1;
  while (true) {
    const existing = await Project.findOne({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

const EDITABLE = [
  "title", "client", "year", "summary", "services", "stack",
  "contexte", "besoin", "approche", "resultat", "link",
  "status", "sort_order",
];

// arrays come in from the form, comma-separated text goes to the DB
function packTags(value) {
  return Array.isArray(value) ? value.join(",") : value;
}

async function list(req, res) {
  try {
    const projects = await Project.findAll({
      include: [{ model: ProjectImage, as: "images" }],
      order: [["sort_order", "ASC"], ["created_at", "DESC"]],
    });
    return res.status(200).json({ ok: true, projects });
  } catch (error) {
    console.error("[admin/projects] list failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger les projets." });
  }
}

async function get(req, res) {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: ProjectImage, as: "images" }],
      order: [[{ model: ProjectImage, as: "images" }, "sort_order", "ASC"]],
    });
    if (!project) return res.status(404).json({ error: "Projet introuvable." });
    return res.status(200).json({ ok: true, project });
  } catch (error) {
    console.error("[admin/projects] get failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger le projet." });
  }
}

async function create(req, res) {
  try {
    const title = (req.body.title || "").trim();
    if (!title) return res.status(400).json({ error: "Le titre est obligatoire." });

    const slug = await uniqueSlug(slugify(title));

    const project = await Project.create({
      title,
      slug,
      status: "brouillon",
    });

    return res.status(201).json({ ok: true, project });
  } catch (error) {
    console.error("[admin/projects] create failed:", error.message);
    return res.status(500).json({ error: "Création impossible." });
  }
}

async function update(req, res) {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Projet introuvable." });

    const updates = {};
    for (const field of EDITABLE) {
      if (field in req.body) {
        updates[field] =
          field === "services" || field === "stack"
            ? packTags(req.body[field])
            : req.body[field];
      }
    }

    // title changed → regenerate the slug, keeping it unique
    if (updates.title && updates.title !== project.title) {
      updates.slug = await uniqueSlug(slugify(updates.title), project.id);
    }

    await project.update(updates);

    const fresh = await Project.findByPk(project.id, {
      include: [{ model: ProjectImage, as: "images" }],
      order: [[{ model: ProjectImage, as: "images" }, "sort_order", "ASC"]],
    });

    return res.status(200).json({ ok: true, project: fresh });
  } catch (error) {
    console.error("[admin/projects] update failed:", error.message);
    return res.status(500).json({ error: "Mise à jour impossible." });
  }
}

async function addImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });

  const detected = await fileTypeFromBuffer(req.file.buffer);
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!detected || !allowed.includes(detected.mime)) {
    return res.status(400).json({ error: "Format non accepté (PNG, JPG ou WEBP)." });
  }

  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: "Projet introuvable." });

    const filename = `${randomUUID()}.${detected.ext}`;
    const diskPath = `uploads/${filename}`;
    await writeFile(diskPath, req.file.buffer);

    // new images land at the end
    const count = await ProjectImage.count({ where: { project_id: project.id } });

    const image = await ProjectImage.create({
      project_id: project.id,
      path: diskPath,
      original_name: req.file.originalname,
      sort_order: count,
    });

    return res.status(201).json({ ok: true, image });
  } catch (error) {
    console.error("[admin/projects] add image failed:", error.message);
    return res.status(500).json({ error: "Ajout du fichier impossible." });
  }
}

async function deleteImage(req, res) {
  try {
    const image = await ProjectImage.findOne({
      where: { id: req.params.imageId, project_id: req.params.id },
    });
    if (!image) return res.status(404).json({ error: "Image introuvable." });

    await unlink(image.path).catch(() => {});
    await image.destroy();

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin/projects] delete image failed:", error.message);
    return res.status(500).json({ error: "Suppression impossible." });
  }
}

// receives { order: [imageId, imageId, ...] } in the new sequence
async function reorderImages(req, res) {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "Ordre invalide." });
    }

    await Promise.all(
      order.map((imageId, index) =>
        ProjectImage.update(
          { sort_order: index },
          { where: { id: imageId, project_id: req.params.id } },
        ),
      ),
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[admin/projects] reorder failed:", error.message);
    return res.status(500).json({ error: "Réordonnancement impossible." });
  }
}

export default { list, get, create, update, addImage, deleteImage, reorderImages };