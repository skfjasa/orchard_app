import { describe, expect, test } from "bun:test";

import { requireSupabase } from "./supabase-service-response";

describe("requireSupabase", () => {
  test("distinguishes a configured client from missing configuration", () => {
    const client = { name: "test-client" };

    expect(requireSupabase(client)).toEqual({ ok: true, value: client });
    expect(requireSupabase(null)).toEqual({
      ok: false,
      error: {
        code: "supabase_not_configured",
        message: "Supabase is not configured.",
      },
    });
  });
});
