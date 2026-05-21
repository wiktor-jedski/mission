import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { QuestViewModel } from "@/lib/player/view-models";

type QuestPageViewProps = {
  quest: QuestViewModel;
  error?: string;
};

export function QuestPageView({ quest, error }: QuestPageViewProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">{PL_DICTIONARY.nav.start}</Link>
        <Link href="/submissions">{PL_DICTIONARY.nav.submissions}</Link>
        <a href="/logout">{PL_DICTIONARY.nav.logout}</a>
      </nav>
      
      <div style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">{PL_DICTIONARY.quest.eyebrow}</p>
        <h1>{quest.title}</h1>
        <p style={{ fontSize: "1.1rem", fontStyle: "italic", color: "var(--text-muted)", marginTop: "0.5rem" }}>
          {quest.flavorText}
        </p>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
        <section aria-labelledby="instructions-heading" className="panel-rugged">
          <h2 id="instructions-heading" style={{ fontSize: "1.15rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
            {PL_DICTIONARY.quest.instructionsHeading}
          </h2>
          <p style={{ marginBottom: 0 }}>{quest.instructions}</p>
        </section>

        <section aria-labelledby="criteria-heading" className="panel-rugged">
          <h2 id="criteria-heading" style={{ fontSize: "1.15rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
            {PL_DICTIONARY.quest.successCriteriaHeading}
          </h2>
          <p style={{ marginBottom: 0 }}>{quest.successCriteria}</p>
        </section>

        <section aria-labelledby="safety-heading" className="panel-rugged" style={{ borderColor: "#6b2626" }}>
          <h2 id="safety-heading" style={{ fontSize: "1.15rem", color: "#e67373", borderBottom: "1px solid #6b2626", paddingBottom: "0.25rem" }}>
            {PL_DICTIONARY.quest.safetyHeading}
          </h2>
          <p style={{ marginBottom: 0 }}>{quest.safetyWarning}</p>
        </section>

        <section aria-labelledby="hint-heading" className="panel-rugged">
          <h2 id="hint-heading" style={{ fontSize: "1.15rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
            {PL_DICTIONARY.quest.hintHeading}
          </h2>
          {quest.hintUsed && quest.hintText ? (
            <p style={{ color: "var(--text-gold)", fontWeight: "500", marginBottom: 0 }}>
              {quest.hintText}
            </p>
          ) : (
            <form action={`/quests/${quest.slug}/hint`} method="post" style={{ marginTop: "0.5rem" }}>
              <button type="submit" className="btn-tactile" style={{ minHeight: "2.5rem", fontSize: "0.85rem" }}>
                {PL_DICTIONARY.quest.showHintButton}
              </button>
            </form>
          )}
        </section>
      </div>

      <div style={{ margin: "1.5rem 0" }}>
        {quest.statusMessage ? (
          <p role="status" style={{ fontWeight: "700", letterSpacing: "0.05em", color: "var(--text-gold)" }}>
            {quest.statusMessage}
          </p>
        ) : null}
        
        {quest.latestRejectionMessage ? (
          <div role="alert" style={{ marginTop: "0.5rem" }}>
            {quest.latestRejectionMessage}
          </div>
        ) : null}
      </div>

      {quest.canSubmit ? (
        <form
          action={`/quests/${quest.slug}/submit`}
          method="post"
          className="stacked-form"
        >
          <label htmlFor="contributor-name">{PL_DICTIONARY.quest.contributorLabel}</label>
          <input
            id="contributor-name"
            name="contributorName"
            type="text"
            required
            maxLength={80}
          />
          
          <label htmlFor="proof-value">{quest.proofLabel}</label>
          <textarea id="proof-value" name="proofValue" required />
          
          <label htmlFor="note">{PL_DICTIONARY.quest.noteLabel}</label>
          <textarea id="note" name="note" maxLength={500} />
          
          {error ? <div role="alert">{error}</div> : null}
          
          <button type="submit">{PL_DICTIONARY.quest.submitButton}</button>
        </form>
      ) : null}
    </main>
  );
}
