import { describe, expect, it } from "vitest";
import { phase1Teams } from "@/lib/seed/phase1";
import {
  getConfiguredTeamPins,
  parseTeamPins,
  verifyTeamPin
} from "@/lib/player/pins";

describe("team PIN helpers", () => {
  it("parses configured team PINs", () => {
    expect(parseTeamPins("team-ember:1234, team-iron:5678")).toEqual([
      { teamId: "team-ember", pin: "1234" },
      { teamId: "team-iron", pin: "5678" }
    ]);
  });

  it("uses local fallback PINs when configuration is absent", () => {
    expect(parseTeamPins(undefined)).toEqual([
      { teamId: "team-ember", pin: "1111" },
      { teamId: "team-iron", pin: "2222" }
    ]);
  });

  it("rejects malformed configured entries", () => {
    expect(() => parseTeamPins("team-ember")).toThrow(
      "TEAM_PINS entries must use team-id:pin format."
    );
    expect(() => parseTeamPins(":1234")).toThrow(
      "TEAM_PINS entries must use team-id:pin format."
    );
  });

  it("verifies only nonblank PINs for known teams without leaking team data", () => {
    expect(
      verifyTeamPin(" 1234 ", phase1Teams, [{ teamId: "team-ember", pin: "1234" }])
    ).toEqual({ status: "valid", teamId: "team-ember" });
    expect(
      verifyTeamPin("1234", phase1Teams, [{ teamId: "missing", pin: "1234" }])
    ).toEqual({ status: "invalid" });
    expect(
      verifyTeamPin(" ", phase1Teams, [{ teamId: "team-ember", pin: "1234" }])
    ).toEqual({ status: "invalid" });
    expect(
      verifyTeamPin("9999", phase1Teams, [{ teamId: "team-ember", pin: "1234" }])
    ).toEqual({ status: "invalid" });
  });

  it("reads configured team PINs from the process environment", () => {
    const originalTeamPins = process.env.TEAM_PINS;
    process.env.TEAM_PINS = "team-ember:abcd";

    expect(getConfiguredTeamPins()).toEqual([{ teamId: "team-ember", pin: "abcd" }]);

    if (originalTeamPins === undefined) {
      delete process.env.TEAM_PINS;
    } else {
      process.env.TEAM_PINS = originalTeamPins;
    }
  });

  it("prefers explicit smoke-test PINs over production-like PINs", () => {
    const originalTeamPins = process.env.TEAM_PINS;
    const originalTestTeamPins = process.env.MISSION_TEST_TEAM_PINS;
    process.env.TEAM_PINS = "team-ember:9999";
    process.env.MISSION_TEST_TEAM_PINS = "team-ember:1111";

    expect(getConfiguredTeamPins()).toEqual([{ teamId: "team-ember", pin: "1111" }]);

    if (originalTeamPins === undefined) {
      delete process.env.TEAM_PINS;
    } else {
      process.env.TEAM_PINS = originalTeamPins;
    }

    if (originalTestTeamPins === undefined) {
      delete process.env.MISSION_TEST_TEAM_PINS;
    } else {
      process.env.MISSION_TEST_TEAM_PINS = originalTestTeamPins;
    }
  });
});
