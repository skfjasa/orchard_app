import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type BackendMode = "mock" | "supabase";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export type Database = Record<string, never>;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export function getSupabaseConfig(): SupabaseConfig | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function getBackendMode(): BackendMode {
  return getSupabaseConfig() ? "supabase" : "mock";
}

export function isSupabaseConfigured(): boolean {
  return getBackendMode() === "supabase";
}

function createSupabaseClient(): SupabaseClient<Database> | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createClient<Database>(config.url, config.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createSupabaseClient();
