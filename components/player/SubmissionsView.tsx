import Link from "next/link";
import type { SubmissionStatusView } from "@/lib/player/view-models";

type SubmissionsViewProps = {
  submissions: readonly SubmissionStatusView[];
};

export function SubmissionsView({ submissions }: SubmissionsViewProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">Start</Link>
        <Link href="/logout">Wyloguj</Link>
      </nav>
      <h1>Zgloszenia druzyny</h1>
      {submissions.length === 0 ? (
        <p>Brak zgloszen.</p>
      ) : (
        <ul className="status-list">
          {submissions.map((submission) => (
            <li key={submission.id}>
              <strong>{submission.questTitle}</strong>
              <span>{submission.statusLabel}</span>
              <span>{submission.contributorName}</span>
              {submission.rejectionMessage ? (
                <p>{submission.rejectionMessage}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
