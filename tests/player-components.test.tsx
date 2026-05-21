import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  AdminReviewList,
  ProofValue,
  ReviewActionForms
} from "@/components/admin/AdminReviewList";
import { MapView } from "@/components/player/MapView";
import { LoginForm } from "@/components/player/LoginForm";
import { PlayerHome } from "@/components/player/PlayerHome";
import { QuestPageView } from "@/components/player/QuestPageView";
import { SubmissionsView } from "@/components/player/SubmissionsView";
import { UnknownQuestView } from "@/components/player/UnknownQuestView";
import { createTeamSession, serializeTeamSession } from "@/lib/player/session";
import type { PendingSubmissionReview } from "@/lib/runtime/repository";
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

describe("phase 3 components", () => {
  it("renders admin login state", () => {
    const { rerender } = render(
      <AdminLoginForm error="Nieprawidlowe haslo admina." nextPath="/admin" />
    );

    expect(screen.getByLabelText("Haslo admina")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nieprawidlowe haslo admina."
    );
    expect(screen.getByDisplayValue("/admin")).toHaveAttribute("name", "next");

    rerender(<AdminLoginForm nextPath="/admin/submissions/submission-01" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders empty and populated admin review lists", () => {
    const { rerender } = render(<AdminReviewList reviews={[]} />);

    expect(screen.getByText("Brak zgloszen oczekujacych.")).toBeInTheDocument();

    rerender(
      <AdminReviewList reviews={[pendingReview()]} error="Nie udalo sie wykonac akcji." />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Nie udalo sie wykonac akcji.");
    expect(screen.getByRole("heading", { name: "Pieczec Bursztynu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Szczegoly" })).toHaveAttribute(
      "href",
      "/admin/submissions/submission-01"
    );
    expect(screen.getByRole("button", { name: "Zatwierdz" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Odrzuc" })).toBeInTheDocument();

    rerender(<AdminReviewList reviews={[pendingReview({ note: null })]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders proof values safely", () => {
    const { rerender } = render(
      <ProofValue proofKind="photo_link" proofValue="https://example.com/proof" />
    );

    expect(screen.getByRole("link", { name: "Otworz link" })).toHaveAttribute(
      "rel",
      "noreferrer noopener"
    );

    rerender(<ProofValue proofKind="text_response" proofValue="odpowiedz" />);
    expect(screen.queryByRole("link", { name: "Otworz link" })).not.toBeInTheDocument();
    expect(screen.getByText("Dowod: odpowiedz")).toBeInTheDocument();

    rerender(<ProofValue proofKind="photo_link" proofValue="nie-url" />);
    expect(screen.getByText("Dowod: nie-url")).toBeInTheDocument();

    rerender(<ProofValue proofKind="photo_link" proofValue="ftp://example.com/proof" />);
    expect(screen.getByText("Dowod: ftp://example.com/proof")).toBeInTheDocument();
  });

  it("renders review action controls", () => {
    render(<ReviewActionForms submissionId="submission-01" />);

    expect(screen.getAllByDisplayValue("submission-01")).toHaveLength(2);
    expect(screen.getByLabelText("Powod odrzucenia")).toBeRequired();
    expect(screen.getByLabelText("Wiadomosc dla druzyny")).toHaveAttribute(
      "maxLength",
      "500"
    );
  });

  it("renders locked and unlocked map states", () => {
    const { rerender } = render(
      <MapView
        map={{
          approvedQuestCount: 20,
          revealedFragmentCount: 20,
          requiredApprovalCount: 21,
          isFinalUnlocked: false
        }}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("20/21");
    expect(screen.getByText("Finalny skarb jest jeszcze zablokowany.")).toBeInTheDocument();

    rerender(
      <MapView
        map={{
          approvedQuestCount: 21,
          revealedFragmentCount: 21,
          requiredApprovalCount: 21,
          isFinalUnlocked: true
        }}
      />
    );
    expect(
      screen.getByRole("link", { name: "Otworz zdjecie finalnej nagrody" })
    ).toHaveAttribute("href", "/final-prize-photo.jpg");
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

const pendingReview = (
  submissionOverrides: Partial<PendingSubmissionReview["submission"]> = {}
): PendingSubmissionReview => ({
  submission: {
    id: "submission-01",
    teamId: "team-ember",
    questId: "quest-01",
    contributorName: "Ala",
    proofKind: "photo_link",
    proofValue: "https://example.com/proof",
    note: "Notatka",
    status: "pending",
    rejectionReason: null,
    rejectionMessage: null,
    submittedAt: "2026-05-21T10:00:00.000Z",
    reviewedAt: null,
    ...submissionOverrides
  },
  team: {
    id: "team-ember",
    name: "Druzyna Zarzewia",
    pinHash: "hash",
    createdAt: "2026-05-21T09:00:00.000Z"
  },
  quest: {
    id: "quest-01",
    slug: "amber-vault-k9q4m2x7",
    title: "Pieczec Bursztynu",
    flavorText: "Krotki opis.",
    instructions: "Wykonaj misje.",
    successCriteria: "Pokaz wynik.",
    safetyWarning: "Bez szkody.",
    proofKind: "photo_link",
    hintText: null,
    isActive: true
  },
  progress: {
    id: "team-ember-quest-01",
    teamId: "team-ember",
    questId: "quest-01",
    status: "pending_review",
    hintUsedAt: null,
    approvedAt: null,
    skippedAt: null
  },
  map: {
    approvedQuestCount: 3,
    revealedFragmentCount: 3,
    requiredApprovalCount: 21,
    isFinalUnlocked: false
  }
});
