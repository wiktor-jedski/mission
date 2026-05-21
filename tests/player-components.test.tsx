import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { LoginForm } from "@/components/player/LoginForm";
import { PlayerHome } from "@/components/player/PlayerHome";
import { QuestPageView } from "@/components/player/QuestPageView";
import { SubmissionsView } from "@/components/player/SubmissionsView";
import { UnknownQuestView } from "@/components/player/UnknownQuestView";
import { createTeamSession, serializeTeamSession } from "@/lib/player/session";
import type { QuestViewModel, SubmissionStatusView } from "@/lib/player/view-models";

const cookieValue = vi.hoisted(() => ({ current: undefined as string | undefined }));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() =>
      cookieValue.current === undefined ? undefined : { value: cookieValue.current }
    )
  }))
}));

describe("player components", () => {
  beforeEach(() => {
    cookieValue.current = undefined;
  });

  it("renders the home page for logged-out players", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { level: 1, name: "Mission Treasure Hunt" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zaloguj druzyne" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("renders the home page for logged-in players", () => {
    render(<PlayerHome teamName="Druzyna Zarzewia" />);

    expect(screen.getByText("Jestes zalogowany jako Druzyna Zarzewia.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zgloszenia" })).toHaveAttribute(
      "href",
      "/submissions"
    );
    expect(screen.getByRole("link", { name: "Wyloguj" })).toHaveAttribute(
      "href",
      "/logout"
    );
  });

  it("renders the async home page for logged-in cookie sessions", async () => {
    cookieValue.current = serializeTeamSession(
      createTeamSession("team-ember", Date.now())
    );

    render(await Home());

    expect(screen.getByText("Jestes zalogowany jako Druzyna Zarzewia.")).toBeInTheDocument();
  });

  it("uses the default login redirect path when none is provided", () => {
    render(<LoginForm />);

    expect(screen.getByDisplayValue("/")).toHaveAttribute("name", "next");
  });

  it("renders login form with invalid PIN feedback", () => {
    render(<LoginForm error="Nieprawidlowy PIN." nextPath="/quests/abc" />);

    expect(screen.getByLabelText("PIN druzyny")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("Nieprawidlowy PIN.");
    expect(screen.getByDisplayValue("/quests/abc")).toHaveAttribute("name", "next");
  });

  it("renders quest content and an enabled proof form", () => {
    render(<QuestPageView quest={questView()} error="Sprawdz dane" />);

    expect(screen.getByRole("heading", { level: 1, name: "Pieczec Bursztynu" })).toBeInTheDocument();
    expect(screen.getByLabelText("Kto dodaje dowod")).toBeRequired();
    expect(screen.getByLabelText("Link do zdjecia")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("Sprawdz dane");
    expect(screen.getByRole("button", { name: "Wyslij dowod" })).toBeInTheDocument();
  });

  it("renders blocked and rejected quest states", () => {
    const { rerender } = render(
      <QuestPageView
        quest={questView({
          canSubmit: false,
          statusMessage: "Dowod czeka na sprawdzenie."
        })}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Dowod czeka na sprawdzenie.");
    expect(screen.queryByRole("button", { name: "Wyslij dowod" })).not.toBeInTheDocument();

    rerender(
      <QuestPageView
        quest={questView({
          latestRejectionMessage: "Popraw dowod.",
          statusMessage: "Dowod odrzucony. Mozecie wyslac nowy."
        })}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Popraw dowod.");
    expect(screen.getByRole("button", { name: "Wyslij dowod" })).toBeInTheDocument();
  });

  it("renders empty and populated submission status views", () => {
    const { rerender } = render(<SubmissionsView submissions={[]} />);

    expect(screen.getByText("Brak zgloszen.")).toBeInTheDocument();

    rerender(
      <SubmissionsView
        submissions={[
          submissionStatusView(),
          submissionStatusView({
            id: "submission-02",
            statusLabel: "Odrzucone",
            rejectionMessage: "Jeszcze raz"
          })
        ]}
      />
    );
    expect(screen.getAllByText("Pieczec Bursztynu")).toHaveLength(2);
    expect(screen.getByText("Czeka na sprawdzenie")).toBeInTheDocument();
    expect(screen.getAllByText("Ala")).toHaveLength(2);
    expect(screen.getByText("Jeszcze raz")).toBeInTheDocument();
  });

  it("renders the safe unknown quest state", () => {
    render(<UnknownQuestView />);

    expect(screen.getByRole("heading", { name: "Misja niedostepna" })).toBeInTheDocument();
    expect(screen.queryByText(/druzyna|dowod|postep/i)).not.toBeInTheDocument();
  });
});

const questView = (overrides: Partial<QuestViewModel> = {}): QuestViewModel => ({
  slug: "amber-vault-k9q4m2x7",
  title: "Pieczec Bursztynu",
  flavorText: "Krotki opis.",
  instructions: "Wykonaj misje.",
  successCriteria: "Pokaz wynik.",
  safetyWarning: "Bez szkody.",
  proofLabel: "Link do zdjecia",
  statusMessage: "Misja gotowa do wykonania.",
  canSubmit: true,
  latestRejectionMessage: null,
  ...overrides
});

const submissionStatusView = (
  overrides: Partial<SubmissionStatusView> = {}
): SubmissionStatusView => ({
  id: "submission-01",
  questTitle: "Pieczec Bursztynu",
  contributorName: "Ala",
  statusLabel: "Czeka na sprawdzenie",
  rejectionMessage: null,
  ...overrides
});
