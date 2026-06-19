export type ServiceMode = "mock" | "supabase";

export interface ServiceContext {
  mode: ServiceMode;
  currentProfileId?: string;
}

export interface ServiceResult<T> {
  data: T;
  source: ServiceMode;
}

export interface ServiceFailure {
  code: string;
  message: string;
}

export type ServiceResponse<T> =
  | { ok: true; value: T }
  | { ok: false; error: ServiceFailure };
