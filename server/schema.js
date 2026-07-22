import { z } from "zod";

export const contactSchema = z.object({
  nom: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  type: z.enum(["vitrine", "sur-mesure", "refonte", "autre"]),
  description: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});