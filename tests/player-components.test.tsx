import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import {
  AdminPendingPoller,
  PENDING_POLL_INTERVAL_MS
} from "@/components/admin/AdminPendingPoller";
import {
  AdminOverrideForms,
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
import type { AuditLogEntry, PendingSubmissionReview } from "@/lib/runtime/repository";
import type { Quest, Team } from "@/lib/domain/types";
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
      screen.getAllByRole("heading", { level: 1, name: "Władca Blantów: Drużyna Ciśnienia" })
    ).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Zaloguj drużynę" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("renders the home page for logged-in players", () => {
    render(<PlayerHome teamName="Druzyna Zarzewia" />);

    expect(screen.getByText(/Jesteś zalogowany jako/)).toBeInTheDocument();
    expect(screen.getByText("Druzyna Zarzewia")).toBeInTheDocument();
    expect(screen.getByText(/W Krainie Gastro, gdzie czerwone ślepia/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zgłoszenia" })).toHaveAttribute(
      "href",
      "/submissions"
    );
    expect(screen.getByRole("link", { name: "Wyloguj się" })).toHaveAttribute(
      "href",
      "/logout"
    );
  });

  it("renders the async home page for logged-in cookie sessions", async () => {
    cookieValue.current = serializeTeamSession(
      createTeamSession("team-ember", Date.now())
    );

    render(await Home());

    expect(screen.getByText(/Jesteś zalogowany jako/)).toBeInTheDocument();
    expect(screen.getByText("Druzyna Zarzewia")).toBeInTheDocument();
  });

  it("uses the default login redirect path when none is provided", () => {
    render(<LoginForm />);

    expect(screen.getByDisplayValue("/")).toHaveAttribute("name", "next");
  });

  it("renders login form with invalid PIN feedback", () => {
    render(<LoginForm error="Nieprawidłowy PIN." nextPath="/quests/abc" />);

    expect(screen.getByLabelText("PIN drużyny")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("Nieprawidłowy PIN.");
    expect(screen.getByDisplayValue("/quests/abc")).toHaveAttribute("name", "next");
  });

  it("renders quest content and an enabled proof form", () => {
    render(<QuestPageView quest={questView()} error="Sprawdz dane" />);

    expect(screen.getByRole("heading", { level: 1, name: "Pieczec Bursztynu" })).toBeInTheDocument();
    expect(screen.getByLabelText("Kto dodaje dowód")).toBeRequired();
    expect(screen.getByLabelText("Link do zdjęcia")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent("Sprawdz dane");
    expect(screen.getByRole("button", { name: "Wyślij dowód" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pokaż podpowiedź" })).not.toBeInTheDocument();
  });

  it("renders seed URLs as clickable external links", () => {
    render(
      <QuestPageView
        quest={questView({
          instructions: "Zobacz https://example.com/instrukcja."
        })}
      />
    );

    expect(screen.getByRole("link", { name: "https://example.com/instrukcja" })).toHaveAttribute(
      "href",
      "https://example.com/instrukcja"
    );
  });

  it("renders quest page with no status message", () => {
    render(
      <QuestPageView
        quest={questView({ statusMessage: null })}
      />
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "Wyślij dowód" })).not.toBeInTheDocument();

    rerender(
      <QuestPageView
        quest={questView({
          latestRejectionMessage: "Popraw dowod.",
          statusMessage: "Dowod odrzucony. Mozecie wyslac nowy."
        })}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Popraw dowod.");
    expect(screen.getByRole("button", { name: "Wyślij dowód" })).toBeInTheDocument();
  });

  it("renders empty and populated submission status views", () => {
    const { rerender } = render(<SubmissionsView submissions={[]} />);

    expect(screen.getByText("Brak zgłoszeń drużyny.")).toBeInTheDocument();

    rerender(
      <SubmissionsView
        submissions={[
          submissionStatusView(),
          submissionStatusView({
            id: "submission-02",
            questSlug: "diamond-seal-a1b2c3d4",
            statusLabel: "Odrzucone",
            rejectionMessage: "Jeszcze raz"
          }),
          submissionStatusView({
            id: "submission-03",
            questSlug: "diamond-seal-a1b2c3d4",
            statusLabel: "Zaakceptowane",
            questTitle: "Pieczec Diamentu"
          })
        ]}
      />
    );
    expect(screen.getAllByText("Pieczec Bursztynu")).toHaveLength(2);
    expect(screen.getByText("Pieczec Diamentu")).toBeInTheDocument();
    expect(screen.getByText("Czeka na sprawdzenie")).toBeInTheDocument();
    expect(screen.getByText("Zaakceptowane")).toBeInTheDocument();
    expect(screen.getAllByText("Ala")).toHaveLength(3);
    expect(screen.getByText("Jeszcze raz")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Pieczec Bursztynu/ })[0]).toHaveAttribute(
      "href",
      "/quests/amber-seal-a1b2c3d4"
    );
    expect(screen.getByRole("link", { name: /Pieczec Diamentu/ })).toHaveAttribute(
      "href",
      "/quests/diamond-seal-a1b2c3d4"
    );
  });

  it("renders the safe unknown quest state", () => {
    render(<UnknownQuestView />);

    expect(screen.getByRole("heading", { name: "Misja niedostępna" })).toBeInTheDocument();
    expect(screen.queryByText(/druzyna|dowod|postep/i)).not.toBeInTheDocument();
  });
});

describe("phase 3 components", () => {
  it("renders admin login state", () => {
    const { rerender } = render(
      <AdminLoginForm error="Nieprawidłowe hasło admina." nextPath="/admin" />
    );

    expect(screen.getByLabelText("Hasło admina")).toBeRequired();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Nieprawidłowe hasło admina."
    );
    expect(screen.getByDisplayValue("/admin")).toHaveAttribute("name", "next");

    rerender(<AdminLoginForm nextPath="/admin/submissions/submission-01" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders empty and populated admin review lists", () => {
    const { rerender } = render(<AdminReviewList reviews={[]} />);

    expect(screen.getByText("Brak oczekujących zgłoszeń.")).toBeInTheDocument();

    rerender(
      <AdminReviewList reviews={[pendingReview()]} error="Nie udalo sie wykonac akcji." />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Nie udalo sie wykonac akcji.");
    expect(screen.getByRole("heading", { name: "Pieczec Bursztynu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Szczegóły/ })).toHaveAttribute(
      "href",
      "/admin/submissions/submission-01"
    );
    expect(screen.getByRole("button", { name: /Zatwierdź/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Odrzuć/ })).toBeInTheDocument();

    rerender(<AdminReviewList reviews={[pendingReview({ note: null })]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders proof values safely", () => {
    const { rerender } = render(
      <ProofValue proofKind="photo_link" proofValue="https://example.com/proof" />
    );

    expect(screen.getByRole("link", { name: "Otwórz link do dowodu" })).toHaveAttribute(
      "rel",
      "noreferrer noopener"
    );

    rerender(<ProofValue proofKind="text_response" proofValue="odpowiedz" />);
    expect(screen.queryByRole("link", { name: "Otwórz link do dowodu" })).not.toBeInTheDocument();
    expect(screen.getByText("odpowiedz")).toBeInTheDocument();

    rerender(<ProofValue proofKind="photo_link" proofValue="nie-url" />);
    expect(screen.getByText("nie-url")).toBeInTheDocument();

    rerender(<ProofValue proofKind="photo_link" proofValue="ftp://example.com/proof" />);
    expect(screen.getByText("ftp://example.com/proof")).toBeInTheDocument();
  });

  it("renders review action controls", () => {
    render(<ReviewActionForms submissionId="submission-01" />);

    expect(screen.getAllByDisplayValue("submission-01")).toHaveLength(2);
    expect(screen.getByLabelText("Powód odrzucenia")).toBeRequired();
    expect(screen.getByLabelText("Wiadomość dla drużyny")).toHaveAttribute(
      "maxLength",
      "500"
    );
  });

  it("renders admin override controls", () => {
    render(<AdminOverrideForms teams={[team()]} quests={[quest()]} />);

    expect(screen.getByRole("heading", { name: "Narzędzia developerskie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Odkryj fragment mapy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ukryj fragment mapy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pomiń misję" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zalicz awarię misji" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj dowód zastępczy" })).toBeInTheDocument();

    const { container } = render(<AdminOverrideForms teams={[]} quests={[quest()]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders admin audit log states", () => {
    const { rerender } = render(<AdminAuditLog entries={[]} />);
    expect(screen.getByText("Brak zdarzeń audytu.")).toBeInTheDocument();

    rerender(
      <AdminAuditLog
        entries={[
          auditEntry("team_login", {}),
          auditEntry("quest_viewed", { repeated: false }),
          auditEntry("submission_created", {}),
          auditEntry("submission_approved", {}),
          auditEntry("submission_rejected", {}),
          auditEntry("manual_fragment_revealed", {}),
          auditEntry("manual_fragment_hidden", {}),
          auditEntry("quest_skipped", {}),
          auditEntry("broken_quest_overridden", {}),
          auditEntry("replacement_proof_entered", {}),
          auditEntry("unknown_action", { reason: "test" }),
          {
            ...auditEntry("team_login_missing_context", {}),
            audit: {
              ...auditEntry("team_login_missing_context", {}).audit,
              action: "team_login" as AuditLogEntry["audit"]["action"]
            },
            team: null,
            quest: null,
            submission: null
          }
        ]}
      />
    );
    expect(screen.getAllByText("Logowanie drużyny")).toHaveLength(2);
    expect(screen.getByText("unknown_action")).toBeInTheDocument();
    expect(screen.getByText("reason: test")).toBeInTheDocument();
  });

  it("polls pending submissions and keeps stale data on errors", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reviews: [pendingReview({ id: "submission-02" })] })
      })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AdminPendingPoller
        initialReviews={[]}
      />
    );

    expect(screen.getByText("Brak oczekujących zgłoszeń.")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PENDING_POLL_INTERVAL_MS);
    });
    expect(screen.getByRole("link", { name: /Szczegóły/ })).toHaveAttribute(
      "href",
      "/admin/submissions/submission-02"
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PENDING_POLL_INTERVAL_MS);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("ostatnie dane");
    expect(screen.getByRole("link", { name: /Szczegóły/ })).toHaveAttribute(
      "href",
      "/admin/submissions/submission-02"
    );

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("shows a refreshing polling state while requests are pending", async () => {
    vi.useFakeTimers();
    let resolveJson: (value: { reviews: readonly PendingSubmissionReview[] }) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          new Promise((resolve) => {
            resolveJson = resolve;
          })
      })
    );

    render(
      <AdminPendingPoller
        initialReviews={[]}
      />
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PENDING_POLL_INTERVAL_MS);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Odświeżam");
    await act(async () => {
      resolveJson({ reviews: [] });
    });

    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders polled text and invalid link proof values as text", () => {
    const { rerender } = render(
      <AdminPendingPoller
        initialReviews={[
          pendingReview({ proofKind: "photo_link", proofValue: "nie-url" })
        ]}
      />
    );
    expect(screen.getByText("nie-url")).toBeInTheDocument();

    rerender(
      <AdminPendingPoller
        initialReviews={[
          pendingReview({ proofKind: "text_response", proofValue: "odpowiedz" })
        ]}
      />
    );
    expect(screen.getByText("odpowiedz")).toBeInTheDocument();

    rerender(
      <AdminPendingPoller
        initialReviews={[
          pendingReview({ proofKind: "photo_link", proofValue: "http://example.com/proof" })
        ]}
      />
    );
    expect(screen.getByRole("link", { name: "Otwórz link do dowodu" })).toHaveAttribute(
      "href",
      "http://example.com/proof"
    );
  });

  it("renders locked and unlocked map states", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: false, soundEnabled: false, introSkipped: true },
      loaded: true,
      updatePreference: vi.fn(),
    });

    const { rerender } = render(
      <MapView
        map={{
          approvedQuestCount: 15,
          revealedFragmentCount: 15,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("15 / 16");
    expect(screen.getByRole("heading", { level: 1, name: "Fragmenty Blanta" })).toBeInTheDocument();
    expect(screen.getByText("Zdobyte fragmenty Blanta")).toBeInTheDocument();
    expect(screen.getByText("Zdobądź 16 zatwierdzonych misji, aby odbudować Blanta")).toBeInTheDocument();

    rerender(
      <MapView
        map={{
          approvedQuestCount: 16,
          revealedFragmentCount: 16,
          requiredApprovalCount: 16,
          isFinalUnlocked: true
        }}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Blant odbudowany" })).toBeInTheDocument();
    expect(
      screen.getByText("Gratulacje! Zdobyliście wszystkie fragmenty i odbudowaliście Blanta.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Otwórz zdjęcie finalnej nagrody" })
    ).toHaveAttribute("href", "/final-prize-photo.jpg");

    rerender(
      <MapView
        map={{
          approvedQuestCount: 5,
          revealedFragmentCount: 5,
          requiredApprovalCount: 0,
          isFinalUnlocked: false
        }}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("5 / 16");
  });

  it("shows the prize link on initial load when enough quests are complete", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: false, introSkipped: true },
      loaded: true,
      updatePreference: vi.fn(),
    });

    render(
      <MapView
        map={{
          approvedQuestCount: 16,
          revealedFragmentCount: 16,
          requiredApprovalCount: 16,
          isFinalUnlocked: true
        }}
      />
    );

    expect(
      screen.getByRole("link", { name: "Otwórz zdjęcie finalnej nagrody" })
    ).toHaveAttribute("href", "/final-prize-photo.jpg");
    expect(
      screen.queryByText("Zdobądź 16 zatwierdzonych misji, aby odbudować Blanta")
    ).not.toBeInTheDocument();
  });

  it("animates newly unlocked map fragments", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: vi.fn(),
    });
    vi.useFakeTimers();

    const { rerender } = render(
      <MapView
        map={{
          approvedQuestCount: 1,
          revealedFragmentCount: 1,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    // Initial state: 1 fragment revealed
    expect(screen.getByRole("status")).toHaveTextContent("1 / 16");

    // Rerender with 2 fragments revealed
    rerender(
      <MapView
        map={{
          approvedQuestCount: 2,
          revealedFragmentCount: 2,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    // Should still show 1 / 16 initially because animation is playing
    expect(screen.getByRole("status")).toHaveTextContent("1 / 16");
    
    // Fast-forward animation
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should now show 2 / 16
    expect(screen.getByRole("status")).toHaveTextContent("2 / 16");
    
    vi.useRealTimers();
  });

  it("handles audio playback errors gracefully", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: vi.fn(),
    });

    const originalPlay = window.HTMLAudioElement.prototype.play;
    window.HTMLAudioElement.prototype.play = vi.fn().mockReturnValue(Promise.reject(new Error("Not allowed")));

    const { rerender } = render(
      <MapView
        map={{
          approvedQuestCount: 1,
          revealedFragmentCount: 1,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    // Trigger animation
    rerender(
      <MapView
        map={{
          approvedQuestCount: 2,
          revealedFragmentCount: 2,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    // Give microtasks a chance to run so the catch block executes
    await act(async () => {
      await Promise.resolve();
    });

    // Animation should still proceed despite audio error (no crash)
    expect(screen.getByRole("status")).toHaveTextContent("1 / 16");

    window.HTMLAudioElement.prototype.play = originalPlay;
  });

  it("handles MapView when preferences are not yet loaded", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: false,
      updatePreference: vi.fn(),
    });

    const { container } = render(
      <MapView
        map={{
          approvedQuestCount: 15,
          revealedFragmentCount: 15,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );
    expect(container).toBeDefined();
  });

  it("applies complete effect when final unlocked and animations enabled", async () => {
    const prefsMod = await import("@/lib/player/preferences");
    vi.spyOn(prefsMod, "useEffectsPreferences").mockReturnValue({
      preferences: { animationsEnabled: true, soundEnabled: true, introSkipped: true },
      loaded: true,
      updatePreference: vi.fn(),
    });
    vi.useFakeTimers();

    const { rerender } = render(
      <MapView
        map={{
          approvedQuestCount: 15,
          revealedFragmentCount: 15,
          requiredApprovalCount: 16,
          isFinalUnlocked: false
        }}
      />
    );

    rerender(
      <MapView
        map={{
          approvedQuestCount: 16,
          revealedFragmentCount: 16,
          requiredApprovalCount: 16,
          isFinalUnlocked: true
        }}
      />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should apply map-complete-effect
    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveClass("map-complete-effect");

    vi.useRealTimers();
  });
});

const questView = (overrides: Partial<QuestViewModel> = {}): QuestViewModel => ({
  slug: "amber-vault-k9q4m2x7",
  title: "Pieczec Bursztynu",
  flavorText: "Krotki opis.",
  instructions: "Wykonaj misje.",
  successCriteria: "Pokaz wynik.",
  safetyWarning: "Bez szkody.",
  proofLabel: "Link do zdjęcia",
  statusMessage: "Misja gotowa do wykonania.",
  canSubmit: true,
  latestRejectionMessage: null,
  ...overrides
});

const team = (overrides: Partial<Team> = {}): Team => ({
  id: "team-ember",
  name: "Druzyna Zarzewia",
  pinHash: "hash",
  mapProgressCount: 0,
  completedQuestCount: 0,
  createdAt: "2026-05-21T09:00:00.000Z",
  ...overrides
});

const quest = (overrides: Partial<Quest> = {}): Quest => ({
  id: "quest-01",
  slug: "amber-vault-k9q4m2x7",
  title: "Pieczec Bursztynu",
  flavorText: "Krotki opis.",
  instructions: "Wykonaj misje.",
  successCriteria: "Pokaz wynik.",
  safetyWarning: "Bez szkody.",
  proofKind: "photo_link",
  hintText: "Podpowiedz",
  isActive: true,
  ...overrides
});

const submissionStatusView = (
  overrides: Partial<SubmissionStatusView> = {}
): SubmissionStatusView => ({
  id: "submission-01",
  questSlug: "amber-seal-a1b2c3d4",
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
    ...team()
  },
  quest: {
    ...quest({ hintText: null })
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
    requiredApprovalCount: 16,
    isFinalUnlocked: false
  }
});

const auditEntry = (
  action: string,
  metadata: Record<string, unknown>
): AuditLogEntry => ({
  audit: {
    id: `audit-${action}`,
    actorType: "admin",
    actorId: null,
    action: action as AuditLogEntry["audit"]["action"],
    teamId: "team-ember",
    questId: "quest-01",
    submissionId: "submission-01",
    metadata,
    createdAt: "2026-05-21T10:00:00.000Z"
  },
  team: team(),
  quest: quest(),
  submission: pendingReview().submission
});
