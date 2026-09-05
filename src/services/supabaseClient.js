// Cliente de Supabase. Si no hay variables de entorno configuradas
// (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), la app sigue funcionando
// perfectamente en modo local (pasar y jugar en un solo dispositivo).
//
// Para activar el modo online:
//   1. Creá un proyecto en https://supabase.com
//   2. Copiá .env.example a .env y completá las dos variables
//   3. Creá las tablas sugeridas en services/gameService.js (comentario de arriba)
//   4. En gameService.js, las funciones ya están escritas para usar
//      `supabase` cuando `isSupabaseConfigured` es true.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
