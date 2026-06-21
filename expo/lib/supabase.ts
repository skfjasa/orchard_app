import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

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
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          birthdate: string | null;
          age_confirmed: boolean;
          age_verified: boolean;
          city: string | null;
          region: string | null;
          country: string | null;
          latitude_approx: number | null;
          longitude_approx: number | null;
          gender: string | null;
          orientation: string | null;
          relationship_structure: string[];
          partnered_status: string | null;
          dating_mode: string | null;
          looking_for: string[];
          boundaries: string[];
          bio: string | null;
          is_visible: boolean;
          is_suspended: boolean;
          is_test_fixture: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
          last_active_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          birthdate?: string | null;
          age_confirmed?: boolean;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude_approx?: number | null;
          longitude_approx?: number | null;
          gender?: string | null;
          orientation?: string | null;
          relationship_structure?: string[];
          partnered_status?: string | null;
          dating_mode?: string | null;
          looking_for?: string[];
          boundaries?: string[];
          bio?: string | null;
          is_visible?: boolean;
          is_test_fixture?: boolean;
          onboarding_completed?: boolean;
          last_active_at?: string | null;
        };
        Update: {
          display_name?: string | null;
          birthdate?: string | null;
          age_confirmed?: boolean;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude_approx?: number | null;
          longitude_approx?: number | null;
          gender?: string | null;
          orientation?: string | null;
          relationship_structure?: string[];
          partnered_status?: string | null;
          dating_mode?: string | null;
          looking_for?: string[];
          boundaries?: string[];
          bio?: string | null;
          is_visible?: boolean;
          is_test_fixture?: boolean;
          onboarding_completed?: boolean;
          last_active_at?: string | null;
        };
        Relationships: [];
      };
      profile_members: {
        Row: {
          id: string;
          profile_id: string;
          display_name: string;
          birthdate: string | null;
          gender: string | null;
          orientation: string | null;
          bio: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          display_name: string;
          birthdate?: string | null;
          gender?: string | null;
          orientation?: string | null;
          bio?: string | null;
          sort_order?: number;
        };
        Update: {
          display_name?: string;
          birthdate?: string | null;
          gender?: string | null;
          orientation?: string | null;
          bio?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      profile_photos: {
        Row: {
          id: string;
          profile_id: string;
          member_id: string;
          storage_path: string;
          sort_order: number;
          moderation_status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          member_id: string;
          storage_path: string;
          sort_order?: number;
          moderation_status?: "pending" | "approved" | "rejected";
        };
        Update: {
          member_id?: string;
          storage_path?: string;
          sort_order?: number;
          moderation_status?: "pending" | "approved" | "rejected";
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          profile_id: string;
          min_age: number | null;
          max_age: number | null;
          max_distance_miles: number | null;
          show_me: string[];
          relationship_structures: string[];
          push_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          min_age?: number | null;
          max_age?: number | null;
          max_distance_miles?: number | null;
          show_me?: string[];
          relationship_structures?: string[];
          push_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          min_age?: number | null;
          max_age?: number | null;
          max_distance_miles?: number | null;
          show_me?: string[];
          relationship_structures?: string[];
          push_enabled?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
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
      detectSessionInUrl: Platform.OS === "web",
    },
  });
}

export const supabase = createSupabaseClient();
