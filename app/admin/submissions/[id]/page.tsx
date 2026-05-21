import Link from "next/link";
import { requireAdmin } from "@/app/admin-session";
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
          <Link href="/admin">Lista</Link>
          <Link href="/admin/logout">Wyloguj</Link>
        </nav>
        <h1>Nie znaleziono zgloszenia</h1>
        <p>To zgloszenie nie oczekuje na sprawdzenie.</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">Lista</Link>
        <Link href="/admin/logout">Wyloguj</Link>
      </nav>
      <h1>{review.quest.title}</h1>
      <p>{review.team.name}</p>
      <p>{review.submission.contributorName}</p>
      {review.submission.note ? <p>{review.submission.note}</p> : null}
      <ProofValue
        proofKind={review.submission.proofKind}
        proofValue={review.submission.proofValue}
      />
      <ReviewActionForms submissionId={review.submission.id} />
    </main>
  );
}
