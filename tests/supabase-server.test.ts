import { describe, expect, it } from "vitest";
import {
  createSupabaseServerClient,
  readSupabaseServerConfig
} from "@/lib/supabase/server";

describe("readSupabaseServerConfig", () => {
  it("reads trimmed server client configuration", () => {
    expect(
      readSupabaseServerConfig({
        NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " key "
      })
    ).toEqual({ url: "https://example.supabase.co", key: "key" });
    expect(
      createSupabaseServerClient({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "key"
      })
    ).toBeDefined();
  });

  it("rejects missing server client configuration", () => {
    expect(() => readSupabaseServerConfig({})).toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL"
    );
    expect(() =>
      readSupabaseServerConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://example.com" })
    ).toThrow("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});
