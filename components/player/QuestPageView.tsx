import Link from "next/link";
import type { QuestViewModel } from "@/lib/player/view-models";

type QuestPageViewProps = {
  quest: QuestViewModel;
  error?: string;
};

export function QuestPageView({ quest, error }: QuestPageViewProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/submissions">Zgloszenia</Link>
        <Link href="/logout">Wyloguj</Link>
      </nav>
      <p className="eyebrow">Misja</p>
      <h1>{quest.title}</h1>
      <p>{quest.flavorText}</p>
      <section aria-labelledby="instructions-heading">
        <h2 id="instructions-heading">Instrukcja</h2>
        <p>{quest.instructions}</p>
      </section>
      <section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading">Warunek sukcesu</h2>
        <p>{quest.successCriteria}</p>
      </section>
      <section aria-labelledby="safety-heading">
        <h2 id="safety-heading">Bezpieczenstwo</h2>
        <p>{quest.safetyWarning}</p>
      </section>
      <p role="status">{quest.statusMessage}</p>
      {quest.latestRejectionMessage ? (
        <p role="alert">{quest.latestRejectionMessage}</p>
      ) : null}
      {quest.canSubmit ? (
        <form
          action={`/quests/${quest.slug}/submit`}
          method="post"
          className="stacked-form"
        >
          <label htmlFor="contributor-name">Kto dodaje dowod</label>
          <input
            id="contributor-name"
            name="contributorName"
            type="text"
            required
            maxLength={80}
          />
          <label htmlFor="proof-value">{quest.proofLabel}</label>
          <textarea id="proof-value" name="proofValue" required />
          <label htmlFor="note">Notatka dla admina</label>
          <textarea id="note" name="note" maxLength={500} />
          {error ? <p role="alert">{error}</p> : null}
          <button type="submit">Wyslij dowod</button>
        </form>
      ) : null}
    </main>
  );
}
