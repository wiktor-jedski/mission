import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { AuditLogEntry } from "@/lib/runtime/repository";

type AdminAuditLogProps = {
  entries: readonly AuditLogEntry[];
};

export function AdminAuditLog({ entries }: AdminAuditLogProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">{PL_DICTIONARY.nav.adminList}</Link>
        <a href="/admin/logout">{PL_DICTIONARY.nav.adminLogout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.admin.auditTitle}</h1>
      
      {entries.length === 0 ? (
        <div className="panel-rugged" style={{ textAlign: "center", opacity: 0.8 }}>
          <p style={{ margin: 0, fontStyle: "italic", color: "var(--text-muted)" }}>
            {PL_DICTIONARY.admin.noAudit}
          </p>
        </div>
      ) : (
        <ul className="status-list">
          {entries.map((entry) => (
            <li key={entry.audit.id}>
              <article>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.1rem", color: "var(--text-gold)", margin: 0, border: "none", padding: 0 }}>
                    {auditLabel(entry.audit.action)}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(entry.audit.createdAt).toLocaleString("pl-PL")}
                  </span>
                </div>
                
                <div style={{ display: "grid", gap: "0.25rem", fontSize: "0.9rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>{PL_DICTIONARY.admin.actorLabel}:</span>{" "}
                    <strong>{entry.audit.actorType}</strong>
                  </div>
                  
                  {entry.team ? (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>{PL_DICTIONARY.admin.teamLabel}:</span>{" "}
                      <strong>{entry.team.name}</strong>
                    </div>
                  ) : null}
                  
                  {entry.quest ? (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>{PL_DICTIONARY.admin.questLabel}:</span>{" "}
                      <strong>{entry.quest.title}</strong>
                    </div>
                  ) : null}
                  
                  {entry.submission ? (
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>{PL_DICTIONARY.admin.contributorLabel}:</span>{" "}
                      <strong>{entry.submission.contributorName}</strong>
                    </div>
                  ) : null}
                  
                  <div style={{ marginTop: "0.25rem", padding: "0.4rem 0.6rem", backgroundColor: "var(--bg-well)", borderRadius: "3px", border: "1px solid var(--border-color)" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{PL_DICTIONARY.admin.metadataLabel}:</span>{" "}
                    <code style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>
                      {metadataText(entry.audit.metadata)}
                    </code>
                  </div>
                </div>
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
      return "Logowanie drużyny";
    case "quest_viewed":
      return "Otwarcie misji";
    case "submission_created":
      return "Nowe zgłoszenie";
    case "submission_approved":
      return "Zatwierdzenie";
    case "submission_rejected":
      return "Odrzucenie";
    case "manual_fragment_revealed":
      return "Ręczne odkrycie fragmentu";
    case "manual_fragment_hidden":
      return "Ręczne ukrycie fragmentu";
    case "quest_skipped":
      return "Pominięcie misji";
    case "broken_quest_overridden":
      return "Zaliczenie awarii misji";
    case "replacement_proof_entered":
      return "Dowód zastępczy";
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
