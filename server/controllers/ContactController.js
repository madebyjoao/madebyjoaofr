import ContactRequest from "../models/ContactRequest.js";
import nodemailer from "nodemailer"; 
import { contactSchema } from "../schema.js";
import jwt from "jsonwebtoken";
import { fileTypeFromBuffer } from "file-type";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { ContactRequestImage } from "../models/index.js";


const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 465,
	secure: true,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});


async function submit(req, res) {

    if (req.body?.website) {
        return res.status(200).json({ ok: true });
    }

    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
        error: "Données invalides.",
        fields: parsed.error.flatten().fieldErrors,
        });
    }
    try {
        const { nom, email, type, description } = parsed.data;

        const request = await ContactRequest.create({ nom, email, type, description });

        try {
        await transporter.sendMail({
            from: `"madebyjoao.fr" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            replyTo: email,
            subject: `Devis — ${type} — ${nom}`,
            text: `Nom : ${nom}\nE-mail : ${email}\nType : ${type}\n\nProjet :\n${description}`,
        });
        } catch (mailError) {
        console.error("[contact] mail failed (saved anyway):", mailError.message);
        }

        const uploadToken = jwt.sign(
        { requestId: request.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
        );

        return res.status(201).json({ ok: true, id: request.id, uploadToken });
        } catch (error) {
            console.error("[contact] submit failed:", error.message);
            return res.status(500).json({ error: "Enregistrement impossible." });
        }
}

async function upload(req, res) {

	if (!req.file) {
		return res.status(400).json({ error: "Aucun fichier reçu." });
	}

	const detected = await fileTypeFromBuffer(req.file.buffer);
	const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

	if (!detected || !allowed.includes(detected.mime)) {
		return res.status(400).json({ error: "Format non accepté (PNG, JPG, WEBP ou PDF)." });
	}

	try {

		const filename = `${randomUUID()}.${detected.ext}`;
		const diskPath = `uploads/${filename}`;

		await writeFile(diskPath, req.file.buffer);

		const image = await ContactRequestImage.create({
		contact_request_id: req.requestId,
		path: diskPath,
		original_name: req.file.originalname,
		});

		console.log(`[upload] saved ${filename} for request ${req.requestId}`);
		return res.status(201).json({ ok: true, imageId: image.id });
	} catch (error) {
		console.error("[upload] save failed:", error.message);
		return res.status(500).json({ error: "Enregistrement du fichier impossible." });
	}
}

export default { submit, upload };