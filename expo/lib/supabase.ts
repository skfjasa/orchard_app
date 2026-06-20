import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type BackendMode = "mock" | "supabase";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          status: "active" | "unmatched" | "blocked";
          created_at: string;
          unmatched_by: string | null;
          unmatched_at: string | null;
        };
        Insert: {
          id?: string;
          user_a: string;
          user_b: string;
          status?: "active" | "unmatched" | "blocked";
          created_at?: string;
          unmatched_by?: string | null;
          unmatched_at?: string | null;
        };
        Update: {
          status?: "active" | "unmatched" | "blocked";
          unmatched_by?: string | null;
          unmatched_at?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          reported_message_id: string | null;
          reason: string;
          details: string | null;
          status: "open" | "reviewing" | "resolved" | "dismissed";
          created_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          reporter_id: string;
          reported_user_id: string;
          reported_message_id?: string | null;
          reason: string;
          details?: string | null;
          status?: "open" | "reviewing" | "resolved" | "dismissed";
        };
        Update: never;
        Relationships: [];
      };
      account_deletion_requests: {
        Row: {
          id: string;
          profile_id: string;
          reason: string | null;
          status: "requested" | "in_progress" | "completed" | "cancelled";
          requested_at: string;
          completed_at: string | null;
        };
        Insert: {
          profile_id: string;
          reason?: string | null;
          status?: "requested" | "in_progress" | "completed" | "cancelled";
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_swipe: {
        Args: {
          target_profile_id: string;
          swipe_decision: "like" | "pass";
        };
        Returns: {
          swipe_id: string;
          match_id: string | null;
          did_match: boolean;
        }[];
      };
      unmatch_match: {
        Args: {
          target_match_id: string;
        };
        Returns: Database["public"]["Tables"]["matches"]["Row"];
      };
      block_profile: {
        Args: {
          blocked_profile_id: string;
        };
        Returns: string;
      };
      submit_report: {
        Args: {
          reported_profile_id: string;
          report_reason: string;
          report_details?: string | null;
          reported_message_id?: string | null;
        };
        Returns: string;
      };
      request_account_deletion: {
        Args: {
          deletion_reason?: string | null;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

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
