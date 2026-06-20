import type { PostgrestError } from "@supabase/supabase-js";

import type { ServiceFailure, ServiceResponse } from "./service-types";

export function ok<T>(value: T): ServiceResponse<T> {
  return { ok: true, value };
}

export function fail<T>(
  code: string,
  message: string,
  details?: PostgrestError | Error | null
): ServiceResponse<T> {
  const error: ServiceFailure = {
    code,
    message: details?.message ?? message,
  };
  return { ok: false, error };
}

export function requireSupabase<T>(
  client: T | null
): ServiceResponse<NonNullable<T>> {
  if (!client) {
    return fail("supabase_not_configured", "Supabase is not configured.");
  }
  return ok(client);
}
