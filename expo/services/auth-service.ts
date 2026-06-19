import type { Session } from "@supabase/supabase-js";

import type { BackendMode } from "@/lib/supabase";

import type { ServiceResponse } from "./service-types";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  mode: BackendMode;
  session: Session | null;
  userId: string | null;
  initialized: boolean;
}

export interface AuthResult {
  mode: BackendMode;
  session: Session | null;
}

export interface AuthService {
  getSession(): Promise<ServiceResponse<AuthResult>>;
  signInWithEmail(
    credentials: AuthCredentials
  ): Promise<ServiceResponse<AuthResult>>;
  signUpWithEmail(
    credentials: AuthCredentials
  ): Promise<ServiceResponse<AuthResult>>;
  signOut(): Promise<ServiceResponse<void>>;
}
