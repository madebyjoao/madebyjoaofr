// src/schemas/contact.js
//
// THE single source of truth for what a valid devis request looks like.
// Imported by ContactView.vue (live validation, the courtesy layer) AND —
// when the backend exists — by the Express endpoint (re-validation, the
// security layer). One schema, two jobs, zero drift.
//
// Client-side validation is a courtesy; server-side validation is security.
// This file lets both run the exact same rules.

import { z } from 'zod'

// The project-type options — mirror the services section so the form speaks
// the same language as the offer. Exported so the component builds its <select>
// from the same list the schema validates against (derive, don't duplicate).
export const PROJECT_TYPES = [
  { value: 'vitrine', label: 'Site vitrine' },
  { value: 'sur-mesure', label: 'Outil sur mesure' },
  { value: 'refonte', label: 'Refonte' },
  { value: 'autre', label: 'Autre' },
]

const projectTypeValues = PROJECT_TYPES.map((t) => t.value)

export const contactSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Votre nom est un peu court.')
    .max(80, 'Votre nom est trop long.'),

  email: z
    .string()
    .trim()
    .email('Cette adresse e-mail ne semble pas valide.'),

  type: z.enum(projectTypeValues, {
    errorMap: () => ({ message: 'Choisissez un type de projet.' }),
  }),

  description: z
    .string()
    .trim()
    .min(10, 'Décrivez votre projet en quelques mots (10 caractères minimum).')
    .max(2000, 'Description trop longue (2000 caractères maximum).'),

  // Honeypot: a field real humans never see or fill (hidden via CSS in the
  // component). Bots fill every field. If this arrives non-empty, it's a bot.
  // Kept in the schema so the server can check it too; must be empty.
  website: z.string().max(0).optional().or(z.literal('')),
})

// Helper the component uses for live, per-field validation.
// Returns { success, errors } where errors is a flat { field: message } map.
export function validateContact(data) {
  const result = contactSchema.safeParse(data)
  if (result.success) return { success: true, errors: {} }

  const errors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field && !errors[field]) errors[field] = issue.message
  }
  return { success: false, errors }
}