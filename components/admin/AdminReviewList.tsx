import Link from "next/link";
import { AdminPendingPoller } from "./AdminPendingPoller";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { PendingSubmissionReview } from "@/lib/runtime/repository";
import type { Quest, Team } from "@/lib/domain/types";

type AdminReviewListProps = {
  reviews: readonly PendingSubmissionReview[];
  teams?: readonly Team[];
  quests?: readonly Quest[];
  error?: string;
};

export function AdminReviewList({
  reviews,
  teams = [],
  quests = [],
  error
}: AdminReviewListProps) {
  return (
    <main className="page-shell" style={{ maxWidth: "64rem" }}>
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">{PL_DICTIONARY.nav.adminList}</Link>
        <Link href="/admin/audit">{PL_DICTIONARY.nav.adminAudit}</Link>
        <a href="/admin/logout">{PL_DICTIONARY.nav.adminLogout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.admin.title}</h1>
      {error ? <div role="alert">{error}</div> : null}
      
      <div className="admin-grid">
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <AdminOverrideForms teams={teams} quests={quests} />
        </div>
        
        <div>
          <h2 style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
            {PL_DICTIONARY.admin.pendingTitle}
          </h2>
          <AdminPendingPoller initialReviews={reviews} />
        </div>
      </div>
    </main>
  );
}

export function AdminOverrideForms({
  teams,
  quests
}: {
  teams: readonly Team[];
  quests: readonly Quest[];
}) {
  if (teams.length === 0 || quests.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="override-heading" className="panel-rugged" style={{ border: "1px dashed var(--border-glow)", padding: "1.25rem" }}>
      <h2 id="override-heading" style={{ fontSize: "1.2rem", color: "var(--text-gold)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
        {PL_DICTIONARY.admin.overridesTitle}
      </h2>
      
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Reveal */}
        <form action="/admin/overrides" method="post" className="stacked-form" style={{ padding: "0.75rem", margin: 0, border: "1px solid var(--border-color)" }}>
          <input type="hidden" name="action" value="reveal" />
          <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-gold)", margin: "0 0 0.5rem 0" }}>Odkrycie fragmentu</p>
          <TeamSelect teams={teams} id="reveal-team" />
          <button type="submit" style={{ marginTop: "0.5rem", minHeight: "2.25rem", fontSize: "0.8rem", width: "100%" }}>
            {PL_DICTIONARY.admin.revealButton}
          </button>
        </form>

        {/* Hide */}
        <form action="/admin/overrides" method="post" className="stacked-form" style={{ padding: "0.75rem", margin: 0, border: "1px solid var(--border-color)" }}>
          <input type="hidden" name="action" value="hide" />
          <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-gold)", margin: "0 0 0.5rem 0" }}>Ukrycie fragmentu</p>
          <TeamSelect teams={teams} id="hide-team" />
          <ReasonInput id="hide-reason" />
          <button type="submit" style={{ marginTop: "0.5rem", minHeight: "2.25rem", fontSize: "0.8rem", width: "100%" }}>
            {PL_DICTIONARY.admin.hideButton}
          </button>
        </form>

        {/* Skip */}
        <form action="/admin/overrides" method="post" className="stacked-form" style={{ padding: "0.75rem", margin: 0, border: "1px solid var(--border-color)" }}>
          <input type="hidden" name="action" value="skip" />
          <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-gold)", margin: "0 0 0.5rem 0" }}>Pominięcie misji</p>
          <TeamSelect teams={teams} id="skip-team" />
          <QuestSelect quests={quests} id="skip-quest" />
          <ReasonInput id="skip-reason" />
          <button type="submit" style={{ marginTop: "0.5rem", minHeight: "2.25rem", fontSize: "0.8rem", width: "100%" }}>
            {PL_DICTIONARY.admin.skipButton}
          </button>
        </form>

        {/* Override */}
        <form action="/admin/overrides" method="post" className="stacked-form" style={{ padding: "0.75rem", margin: 0, border: "1px solid var(--border-color)" }}>
          <input type="hidden" name="action" value="override" />
          <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-gold)", margin: "0 0 0.5rem 0" }}>Awaryjne zaliczenie</p>
          <TeamSelect teams={teams} id="override-team" />
          <QuestSelect quests={quests} id="override-quest" />
          <ReasonInput id="override-reason" />
          <button type="submit" style={{ marginTop: "0.5rem", minHeight: "2.25rem", fontSize: "0.8rem", width: "100%" }}>
            {PL_DICTIONARY.admin.overrideButton}
          </button>
        </form>

        {/* Replacement */}
        <form action="/admin/overrides" method="post" className="stacked-form" style={{ padding: "0.75rem", margin: 0, border: "1px solid var(--border-color)" }}>
          <input type="hidden" name="action" value="replacement" />
          <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-gold)", margin: "0 0 0.5rem 0" }}>Dowód zastępczy</p>
          
          <TeamSelect teams={teams} id="replacement-team" />
          <QuestSelect quests={quests} id="replacement-quest" />
          
          <label htmlFor="replacement-contributor">{PL_DICTIONARY.admin.contributorLabel}</label>
          <input id="replacement-contributor" name="contributorName" required style={{ minHeight: "2.25rem", padding: "0.4rem 0.6rem" }} />
          
          <label htmlFor="replacement-kind">{PL_DICTIONARY.admin.proofKindLabel}</label>
          <select id="replacement-kind" name="proofKind" required style={{ minHeight: "2.25rem", padding: "0.4rem 0.6rem" }}>
            <option value="photo_link">Link do zdjęcia</option>
            <option value="video_link">Link do filmu</option>
            <option value="audio_link">Link do audio</option>
            <option value="text_response">Odpowiedź tekstowa</option>
          </select>
          
          <label htmlFor="replacement-proof">{PL_DICTIONARY.admin.proofLabel}</label>
          <textarea id="replacement-proof" name="proofValue" required style={{ minHeight: "3rem", padding: "0.4rem 0.6rem" }} />
          
          <label htmlFor="replacement-note">{PL_DICTIONARY.admin.noteLabel}</label>
          <textarea id="replacement-note" name="note" maxLength={500} style={{ minHeight: "3rem", padding: "0.4rem 0.6rem" }} />
          
          <label htmlFor="replacement-status">{PL_DICTIONARY.admin.statusLabel}</label>
          <select id="replacement-status" name="status" required style={{ minHeight: "2.25rem", padding: "0.4rem 0.6rem" }}>
            <option value="pending">Do sprawdzenia</option>
            <option value="approved">Zaakceptowany</option>
          </select>
          
          <button type="submit" style={{ marginTop: "0.5rem", minHeight: "2.25rem", fontSize: "0.8rem", width: "100%" }}>
            {PL_DICTIONARY.admin.replacementButton}
          </button>
        </form>
      </div>
    </section>
  );
}

function TeamSelect({ teams, id }: { teams: readonly Team[]; id: string }) {
  return (
    <>
      <label htmlFor={id} style={{ fontSize: "0.75rem" }}>{PL_DICTIONARY.admin.teamLabel}</label>
      <select id={id} name="teamId" required style={{ minHeight: "2.25rem", padding: "0.4rem 0.6rem", fontSize: "0.9rem" }}>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </>
  );
}

function QuestSelect({ quests, id }: { quests: readonly Quest[]; id: string }) {
  return (
    <>
      <label htmlFor={id} style={{ fontSize: "0.75rem" }}>{PL_DICTIONARY.admin.questLabel}</label>
      <select id={id} name="questId" required style={{ minHeight: "2.25rem", padding: "0.4rem 0.6rem", fontSize: "0.9rem" }}>
        {quests.map((quest) => (
          <option key={quest.id} value={quest.id}>
            {quest.title}
          </option>
        ))}
      </select>
    </>
  );
}

function ReasonInput({ id }: { id: string }) {
  return (
    <>
      <label htmlFor={id} style={{ fontSize: "0.75rem" }}>{PL_DICTIONARY.admin.reasonLabel}</label>
      <textarea id={id} name="reason" required maxLength={300} style={{ minHeight: "2.5rem", padding: "0.4rem 0.6rem" }} />
    </>
  );
}

export function ProofValue({
  proofKind,
  proofValue
}: {
  proofKind: string;
  proofValue: string;
}) {
  if (proofKind !== "text_response" && isHttpUrl(proofValue)) {
    return (
      <p style={{ margin: 0 }}>
        <strong>{PL_DICTIONARY.admin.proofLabel}:</strong>{" "}
        <a href={proofValue} target="_blank" rel="noreferrer noopener" style={{ textDecoration: "underline", color: "var(--text-gold)" }}>
          Otwórz link do dowodu
        </a>
      </p>
    );
  }

  return (
    <p style={{ margin: 0 }}>
      <strong>{PL_DICTIONARY.admin.proofLabel}:</strong> <span style={{ wordBreak: "break-all" }}>{proofValue}</span>
    </p>
  );
}

export function ReviewActionForms({ submissionId }: { submissionId: string }) {
  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem" }}>
      <div>
        <form action="/admin/review" method="post">
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="action" value="approve" />
          <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #3f7a3a 0%, #204d1d 100%)", borderColor: "#559e4e" }}>
            ✓ {PL_DICTIONARY.admin.approveBtn}
          </button>
        </form>
      </div>
      
      <div style={{ marginTop: "0.5rem" }}>
        <form action="/admin/review" method="post" className="stacked-form" style={{ maxWidth: "100%", margin: 0, padding: "1rem" }}>
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="action" value="reject" />
          
          <label htmlFor={`reason-${submissionId}`}>{PL_DICTIONARY.admin.rejectionReasonLabel}</label>
          <select id={`reason-${submissionId}`} name="reason" required>
            <option value="wrong_proof">Zły dowód</option>
            <option value="link_inaccessible">Link nie działa</option>
            <option value="quest_incomplete">Misja nieukończona</option>
            <option value="other">Inny powód</option>
          </select>
          
          <label htmlFor={`message-${submissionId}`}>{PL_DICTIONARY.admin.rejectionMessageLabel}</label>
          <textarea id={`message-${submissionId}`} name="message" maxLength={500} style={{ minHeight: "3.5rem" }} />
          
          <button type="submit" style={{ background: "linear-gradient(135deg, #a63a3a 0%, #5d1717 100%)", borderColor: "#d14b4b" }}>
            ✗ {PL_DICTIONARY.admin.rejectBtn}
          </button>
        </form>
      </div>
    </div>
  );
}

const isHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};
