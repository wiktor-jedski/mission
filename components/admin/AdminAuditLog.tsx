import Link from "next/link";
import type { AuditLogEntry } from "@/lib/runtime/repository";

type AdminAuditLogProps = {
  entries: readonly AuditLogEntry[];
};

export function AdminAuditLog({ entries }: AdminAuditLogProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">Zgloszenia</Link>
        <a href="/admin/logout">Wyloguj</a>
      </nav>
      <h1>Dziennik audytu</h1>
      {entries.length === 0 ? (
        <p>Brak zdarzen audytu.</p>
      ) : (
        <ul className="status-list">
          {entries.map((entry) => (
            <li key={entry.audit.id}>
              <article>
                <h2>{auditLabel(entry.audit.action)}</h2>
                <p>{new Date(entry.audit.createdAt).toLocaleString("pl-PL")}</p>
                <p>Aktor: {entry.audit.actorType}</p>
                {entry.team ? <p>Druzyna: {entry.team.name}</p> : null}
                {entry.quest ? <p>Misja: {entry.quest.title}</p> : null}
                {entry.submission ? (
                  <p>Zgloszenie: {entry.submission.contributorName}</p>
                ) : null}
                <p>Metadane: {metadataText(entry.audit.metadata)}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

const auditLabel = (action: string): string => {
  switch (action) {
    case "team_login":
      return "Logowanie druzyny";
    case "quest_viewed":
      return "Otwarcie misji";
    case "submission_created":
      return "Nowe zgloszenie";
    case "hint_used":
      return "Uzycie podpowiedzi";
    case "submission_approved":
      return "Zatwierdzenie";
    case "submission_rejected":
      return "Odrzucenie";
    case "manual_fragment_revealed":
      return "Reczne odkrycie fragmentu";
    case "manual_fragment_hidden":
      return "Reczne ukrycie fragmentu";
    case "quest_skipped":
      return "Pominiecie misji";
    case "broken_quest_overridden":
      return "Zaliczenie awarii misji";
    case "replacement_proof_entered":
      return "Dowod zastepczy";
    default:
      return action;
  }
};

const metadataText = (metadata: Record<string, unknown>): string => {
  const entries = Object.entries(metadata).filter(([, value]) => value !== null);
  return entries.length === 0
    ? "brak"
    : entries.map(([key, value]) => `${key}: ${String(value)}`).join(", ");
};
