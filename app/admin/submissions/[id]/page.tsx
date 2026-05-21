import Link from "next/link";
import { requireAdmin } from "@/app/admin-session";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import {
  ProofValue,
  ReviewActionForms
} from "@/components/admin/AdminReviewList";
import { getRuntimeRepository } from "@/lib/runtime";

type AdminSubmissionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSubmissionPage({
  params
}: AdminSubmissionPageProps) {
  const { id } = await params;
  await requireAdmin(`/admin/submissions/${id}`);
  const review = await getRuntimeRepository().getPendingSubmission(id);

  if (!review) {
    return (
      <main className="page-shell">
        <nav className="inline-nav" aria-label="Nawigacja admina">
          <Link href="/admin">{PL_DICTIONARY.nav.start}</Link>
          <a href="/admin/logout">{PL_DICTIONARY.nav.adminLogout}</a>
        </nav>
        
        <div className="panel-rugged" style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ border: "none", color: "var(--color-error)" }}>Nie znaleziono zgłoszenia</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>To zgłoszenie nie oczekuje już na sprawdzenie.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">{PL_DICTIONARY.nav.adminList}</Link>
        <a href="/admin/logout">{PL_DICTIONARY.nav.adminLogout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.admin.submissionDetailsTitle}</h1>
      
      <div className="panel-rugged" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--text-gold)", border: "none", margin: 0 }}>{review.quest.title}</h2>
        <p style={{ margin: "0.25rem 0 1rem 0", color: "var(--text-muted)" }}>
          Drużyna: <strong style={{ color: "var(--text-primary)" }}>{review.team.name}</strong> | Autor: <strong style={{ color: "var(--text-primary)" }}>{review.submission.contributorName}</strong>
        </p>
        
        {review.submission.note ? (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--bg-well)", borderRadius: "4px", border: "1px solid var(--border-color)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.25rem" }}>
              Notatka od gracza:
            </span>
            {review.submission.note}
          </div>
        ) : null}
        
        <div style={{ padding: "1rem", backgroundColor: "var(--bg-well)", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
          <ProofValue
            proofKind={review.submission.proofKind}
            proofValue={review.submission.proofValue}
          />
        </div>
      </div>
      
      <ReviewActionForms submissionId={review.submission.id} />
    </main>
  );
}
