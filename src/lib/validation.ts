import { z } from "zod";

// Schema de validation pour les emails
export const emailSchema = z
  .string()
  .min(1, "Email requis")
  .max(254, "Email trop long")
  .email("Format email invalide")
  .transform(email => email.trim().toLowerCase());

// Schema de validation pour les prompts
export const promptSchema = z
  .string()
  .min(8, "Prompt trop court (minimum 8 caractères)")
  .max(500, "Prompt trop long (maximum 500 caractères)")
  .regex(/^[a-zA-Z0-9\s.,!?\-'àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/, "Caractères non autorisés dans le prompt")
  .transform(prompt => prompt.trim());

// Schema de validation pour les fichiers images
export const imageFileSchema = z
  .instanceof(File)
  .refine(file => file.size <= 8 * 1024 * 1024, "Fichier trop volumineux (max 8 Mo)")
  .refine(file => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }, "Format de fichier non supporté")
  .refine(file => {
    // Validation du nom de fichier pour éviter les injections
    const fileName = file.name;
    return fileName.length <= 255 && /^[a-zA-Z0-9._-]+$/.test(fileName);
  }, "Nom de fichier invalide");

// Schema pour les requêtes waitlist
export const waitlistRequestSchema = z.object({
  email: emailSchema
});

// Schema pour les requêtes de génération
export const generateRequestSchema = z.object({
  prompt: promptSchema,
  image: imageFileSchema
});

// Fonction de validation sécurisée
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError?.message || "Validation échouée" };
    }
    return { success: false, error: "Erreur de validation inconnue" };
  }
}

// Sanitisation HTML pour éviter XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validation des URLs pour éviter les redirections malveillantes
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Autoriser seulement HTTPS et les domaines de confiance
    const allowedProtocols = ['https:'];
    const allowedHosts = [
      'replicate.com',
      'replicate.delivery', // URLs de sortie Replicate
      'storage.googleapis.com',
      'supabase.co', // Domaines Supabase
      'supabase.in', // Domaines Supabase alternatifs
    ];
    
    return allowedProtocols.includes(parsedUrl.protocol) && 
           allowedHosts.some(host => parsedUrl.hostname.endsWith(host));
  } catch {
    return false;
  }
}
