import { describe, expect, it } from "vitest";
import { resolvePlayerAccess } from "@/lib/player/auth-guard";
import {
  createTeamSession,
  normalizePlayerRedirect,
  parseTeamSession,
  serializeTeamSession
} from "@/lib/player/session";

describe("team session helpers", () => {
  it("creates, serializes, and parses an authenticated session", () => {
    const session = createTeamSession("team-ember", 1000, 60);

    expect(parseTeamSession(serializeTeamSession(session), 2000)).toEqual({
      status: "authenticated",
      session: {
        teamId: "team-ember",
        issuedAt: 1000,
        expiresAt: 61000
      }
    });
  });

  it("rejects invalid session creation inputs", () => {
    expect(() => createTeamSession(" ", 1000)).toThrow("Team id is required.");
    expect(() => createTeamSession("team-ember", -1)).toThrow(
      "Issued timestamp is invalid."
    );
    expect(() => createTeamSession("team-ember", 1000, 0)).toThrow(
      "Session max age must be positive."
    );
  });

  it("handles missing, malformed, invalid, and expired cookies", () => {
    expect(parseTeamSession(undefined, 1000)).toEqual({ status: "missing" });
    expect(parseTeamSession("not-base64-json", 1000)).toEqual({
      status: "invalid"
    });
    expect(
      parseTeamSession(
        Buffer.from(JSON.stringify({ teamId: "", issuedAt: 1, expiresAt: 2 })).toString(
          "base64url"
        ),
        1
      )
    ).toEqual({ status: "invalid" });
    expect(
      parseTeamSession(
        serializeTeamSession(createTeamSession("team-ember", 1000, 1)),
        2000
      )
    ).toEqual({ status: "expired" });
  });

  it("normalizes player redirects", () => {
    expect(normalizePlayerRedirect("/quests/abc", "/")).toBe("/quests/abc");
    expect(normalizePlayerRedirect("", "/")).toBe("/");
    expect(normalizePlayerRedirect("https://evil.example", "/")).toBe("/");
    expect(normalizePlayerRedirect("//evil.example", "/")).toBe("/");
    expect(normalizePlayerRedirect("/admin", "/")).toBe("/");
  });
});

describe("player auth guard", () => {
  it("allows an authenticated known team", () => {
    const session = createTeamSession("team-ember", 1000);

    expect(
      resolvePlayerAccess(
        { status: "authenticated", session },
        (teamId) => teamId === "team-ember",
        "/quests/abc"
      )
    ).toEqual({ status: "allowed", teamId: "team-ember" });
  });

  it("redirects missing, invalid, expired, and unknown-team sessions", () => {
    expect(resolvePlayerAccess({ status: "missing" }, () => true, "/x")).toEqual({
      status: "redirect",
      destination: "/login?next=%2Fx"
    });
    expect(resolvePlayerAccess({ status: "invalid" }, () => true, "//x")).toEqual({
      status: "redirect",
      destination: "/login?next=%2F"
    });
    expect(resolvePlayerAccess({ status: "expired" }, () => true, "/x")).toEqual({
      status: "redirect",
      destination: "/login?next=%2Fx"
    });
    expect(
      resolvePlayerAccess(
        { status: "authenticated", session: createTeamSession("missing", 1000) },
        () => false,
        "/x"
      )
    ).toEqual({ status: "redirect", destination: "/login?next=%2Fx" });
  });
});
