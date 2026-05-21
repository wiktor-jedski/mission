import { describe, expect, it } from "vitest";
import { resolveAdminAccess } from "@/lib/admin/auth-guard";
import { verifyAdminPassword } from "@/lib/admin/password";
import { validateReviewAction } from "@/lib/admin/review-actions";
import {
  adminCookieOptions,
  clearAdminCookieOptions,
  createAdminSession,
  isSafeAdminRedirect,
  normalizeAdminRedirect,
  parseAdminSession,
  serializeAdminSession
} from "@/lib/admin/session";

describe("admin session", () => {
  it("creates, serializes, and parses valid admin sessions", () => {
    const session = createAdminSession(1000, 10);

    expect(session).toEqual({
      role: "admin",
      issuedAt: 1000,
      expiresAt: 11000
    });
    expect(parseAdminSession(serializeAdminSession(session), 2000)).toEqual({
      status: "authenticated",
      session
    });
  });

  it("rejects invalid session inputs and payloads", () => {
    expect(() => createAdminSession(-1)).toThrow("Issued timestamp is invalid.");
    expect(() => createAdminSession(1, 0)).toThrow(
      "Session max age must be positive."
    );
    expect(parseAdminSession(undefined, 1)).toEqual({ status: "missing" });
    expect(parseAdminSession("not-base64", 1)).toEqual({ status: "invalid" });
    expect(
      parseAdminSession(
        Buffer.from(JSON.stringify({ role: "team", issuedAt: 1, expiresAt: 2 }))
          .toString("base64url"),
        1
      )
    ).toEqual({ status: "invalid" });
    expect(
      parseAdminSession(serializeAdminSession(createAdminSession(1000, 1)), 2000)
    ).toEqual({ status: "expired" });
  });

  it("defines secure cookie and redirect behavior", () => {
    expect(adminCookieOptions()).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/admin"
    });
    expect(clearAdminCookieOptions()).toMatchObject({ maxAge: 0 });
    expect(isSafeAdminRedirect("/admin/submissions/abc")).toBe(true);
    expect(isSafeAdminRedirect("/admin/login")).toBe(false);
    expect(isSafeAdminRedirect("//admin")).toBe(false);
    expect(isSafeAdminRedirect("https://example.com/admin")).toBe(false);
    expect(normalizeAdminRedirect(" /admin ")).toBe("/admin");
    expect(normalizeAdminRedirect(undefined)).toBe("/admin");
    expect(normalizeAdminRedirect("/admin/login")).toBe("/admin");
  });
});

describe("admin auth", () => {
  it("verifies configured passwords without leaking expected values", () => {
    expect(verifyAdminPassword("secret", "secret")).toEqual({ status: "valid" });
    expect(verifyAdminPassword("wrong", "secret")).toEqual({ status: "invalid" });
    expect(verifyAdminPassword("secret1", "secret")).toEqual({ status: "invalid" });
    expect(verifyAdminPassword("secret", "   ")).toEqual({
      status: "missing_configuration"
    });
  });

  it("resolves admin access", () => {
    expect(
      resolveAdminAccess(
        { status: "authenticated", session: createAdminSession(1) },
        "/admin"
      )
    ).toEqual({ status: "authenticated" });
    expect(resolveAdminAccess({ status: "missing" }, "/admin/review")).toEqual({
      status: "redirect",
      destination: "/admin/login?next=%2Fadmin%2Freview"
    });
  });
});

describe("review action validation", () => {
  it("validates approvals and rejections", () => {
    expect(
      validateReviewAction({ action: "approve", submissionId: "submission-01" })
    ).toEqual({
      valid: true,
      data: { action: "approve", submissionId: "submission-01" }
    });
    expect(
      validateReviewAction({
        action: "reject",
        submissionId: "submission-01",
        reason: "wrong_proof",
        message: " popraw "
      })
    ).toEqual({
      valid: true,
      data: {
        action: "reject",
        submissionId: "submission-01",
        reason: "wrong_proof",
        message: "popraw"
      }
    });
    expect(
      validateReviewAction({
        action: "reject",
        submissionId: "submission-01",
        reason: "other",
        message: "   "
      })
    ).toEqual({
      valid: true,
      data: {
        action: "reject",
        submissionId: "submission-01",
        reason: "other",
        message: null
      }
    });
  });

  it("maps invalid review action input to safe errors", () => {
    expect(validateReviewAction({ action: "approve", submissionId: "" })).toEqual({
      valid: false,
      error: "Nieprawidlowe zgloszenie."
    });
    expect(validateReviewAction({ action: "approve" } as Record<string, string | null>)).toEqual({
      valid: false,
      error: "Nieprawidlowe zgloszenie."
    });
    expect(validateReviewAction({ action: null, submissionId: "submission-01" })).toEqual({
      valid: false,
      error: "Nieznana akcja."
    });
    expect(
      validateReviewAction({ action: "delete", submissionId: "submission-01" })
    ).toEqual({ valid: false, error: "Nieznana akcja." });
    expect(
      validateReviewAction({
        action: "reject",
        submissionId: "submission-01",
        reason: null,
        message: null
      })
    ).toEqual({ valid: false, error: "Wybierz powod odrzucenia." });
    expect(
      validateReviewAction({
        action: "reject",
        submissionId: "submission-01",
        reason: "other",
        message: "x".repeat(501)
      })
    ).toEqual({ valid: false, error: "Wiadomosc jest za dluga." });
  });
});
