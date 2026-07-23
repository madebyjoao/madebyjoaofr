import { Project, ProjectImage } from "../models/index.js";

// the DB stores tags as comma-separated text; the API speaks arrays
function toArray(value) {
  return value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// shape a row into what the frontend expects
function present(project) {
  const p = project.toJSON();
  return {
    ...p,
    services: toArray(p.services),
    stack: toArray(p.stack),
    story: {
      contexte: p.contexte,
      besoin: p.besoin,
      approche: p.approche,
      resultat: p.resultat,
    },
    images: (p.images || []).map((img) => `/${img.path}`),
  };
}

async function list(req, res) {
  try {
    const projects = await Project.findAll({
      where: { status: "publie" },
      include: [{ model: ProjectImage, as: "images" }],
      order: [
        ["sort_order", "ASC"],
        ["year", "DESC"],
        [{ model: ProjectImage, as: "images" }, "sort_order", "ASC"],
      ],
    });

    return res.status(200).json({ ok: true, projects: projects.map(present) });
  } catch (error) {
    console.error("[projects] list failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger les projets." });
  }
}

async function getBySlug(req, res) {
  try {
    const project = await Project.findOne({
      where: { slug: req.params.slug, status: "publie" },
      include: [{ model: ProjectImage, as: "images" }],
      order: [[{ model: ProjectImage, as: "images" }, "sort_order", "ASC"]],
    });

    if (!project) {
      return res.status(404).json({ error: "Projet introuvable." });
    }

    return res.status(200).json({ ok: true, project: present(project) });
  } catch (error) {
    console.error("[projects] get failed:", error.message);
    return res.status(500).json({ error: "Impossible de charger le projet." });
  }
}

export default { list, getBySlug };