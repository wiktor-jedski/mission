import { describe, expect, it } from "vitest";
import { readRuntimeEnv, type RawRuntimeEnv } from "@/lib/env";

const validEnv: RawRuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-anon-key",
  TEAM_PINS: "alpha:1111,beta:2222",
  ADMIN_PASSWORD: "admin-password",
  APP_BASE_URL: "https://mission.example"
};

describe("readRuntimeEnv", () => {
  it("returns a typed environment contract when all values are present", () => {
    expect(readRuntimeEnv(validEnv)).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseAnonKey: "public-anon-key",
      teamPins: "alpha:1111,beta:2222",
      adminPassword: "admin-password",
      appBaseUrl: "https://mission.example"
    });
  });

  it("trims configured values", () => {
    expect(
      readRuntimeEnv({
        ...validEnv,
        APP_BASE_URL: " https://mission.example "
      }).appBaseUrl
    ).toBe("https://mission.example");
  });

  it("rejects missing values", () => {
    const missingBaseUrl = { ...validEnv };
    delete missingBaseUrl.APP_BASE_URL;

    expect(() => readRuntimeEnv(missingBaseUrl)).toThrow(
      "Missing required environment variable: APP_BASE_URL"
    );
  });

  it("rejects blank values", () => {
    expect(() =>
      readRuntimeEnv({
        ...validEnv,
        ADMIN_PASSWORD: "   "
      })
    ).toThrow("Missing required environment variable: ADMIN_PASSWORD");
  });
});
