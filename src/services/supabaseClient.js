// Cliente de Supabase. Si no hay variables de entorno configuradas
// (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY), la app sigue funcionando
// perfectamente en modo local (pasar y jugar en un solo dispositivo).
//
// Para activar el modo online:
//   1. Creá un proyecto en https://supabase.com
//   2. Copiá .env.example a .env y completá las dos variables
//   3. Ejecutá supabase/schema.sql desde el SQL Editor.
//   4. Las salas se administran desde services/onlineGameService.js.

import { createClient } from "@supabase/supabase-js";

const environment = import.meta.env ?? {};
const supabaseUrl = environment.VITE_SUPABASE_URL;
const supabasePublishableKey =
  environment.VITE_SUPABASE_PUBLISHABLE_KEY ||
  environment.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
