import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { SubmissionStatusView } from "@/lib/player/view-models";

type SubmissionsViewProps = {
  submissions: readonly SubmissionStatusView[];
};

export function SubmissionsView({ submissions }: SubmissionsViewProps) {
  const getStatusStyle = (label: string) => {
    switch (label) {
      case "Zaakceptowane":
        return {
          backgroundColor: "var(--color-success-bg)",
          color: "var(--text-primary)",
          borderColor: "var(--color-success)",
        };
      case "Odrzucone":
        return {
          backgroundColor: "var(--color-error-bg)",
          color: "var(--text-primary)",
          borderColor: "var(--color-error)",
        };
      default:
        return {
          backgroundColor: "var(--color-pending-bg)",
          color: "var(--text-primary)",
          borderColor: "var(--color-pending)",
        };
    }
  };

  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">{PL_DICTIONARY.nav.start}</Link>
        <Link href="/map">{PL_DICTIONARY.nav.map}</Link>
        <a href="/logout">{PL_DICTIONARY.nav.logout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.submissions.title}</h1>
      
      {submissions.length === 0 ? (
        <div className="panel-rugged" style={{ textAlign: "center", opacity: 0.8 }}>
          <p style={{ margin: 0, fontStyle: "italic", color: "var(--text-muted)" }}>
            {PL_DICTIONARY.submissions.emptyState}
          </p>
        </div>
      ) : (
        <ul className="status-list">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--text-gold)" }}>
                  {submission.questTitle}
                </strong>
                <span 
                  role="status"
                  className="badge-status"
                  style={{ 
                    ...getStatusStyle(submission.statusLabel),
                    border: "1px solid",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "3px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap"
                  }}
                >
                  {submission.statusLabel}
                </span>
              </div>
              
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Dodane przez: <strong style={{ color: "var(--text-primary)" }}>{submission.contributorName}</strong>
              </div>
              
              {submission.rejectionMessage ? (
                <div 
                  role="alert" 
                  style={{ 
                    marginTop: "0.75rem", 
                    fontSize: "0.9rem", 
                    padding: "0.75rem 1rem",
                    borderLeft: "3px solid var(--color-error)",
                    backgroundColor: "rgba(166, 58, 58, 0.05)"
                  }}
                >
                  <p style={{ fontWeight: "bold", color: "#e67373", margin: "0 0 0.25rem 0" }}>Wiadomość od administratora:</p>
                  <p style={{ margin: 0 }}>{submission.rejectionMessage}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
