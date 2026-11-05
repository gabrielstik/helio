/** Faux tant que .env.local ne renseigne pas le projet Supabase : l'app s'affiche alors sans session. */
export const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
