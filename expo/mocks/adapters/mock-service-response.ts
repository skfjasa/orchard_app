import type { ServiceFailure, ServiceResponse } from "@/services";

export function ok<T>(value: T): ServiceResponse<T> {
  return { ok: true, value };
}

export function fail<T>(code: string, message: string): ServiceResponse<T> {
  const error: ServiceFailure = { code, message };
  return { ok: false, error };
}
