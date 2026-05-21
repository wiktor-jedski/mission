import Link from "next/link";
import type { PendingSubmissionReview } from "@/lib/runtime/repository";

type AdminReviewListProps = {
  reviews: readonly PendingSubmissionReview[];
  error?: string;
};

export function AdminReviewList({ reviews, error }: AdminReviewListProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin/logout">Wyloguj</Link>
      </nav>
      <h1>Zgloszenia do sprawdzenia</h1>
      {error ? <p role="alert">{error}</p> : null}
      {reviews.length === 0 ? (
        <p>Brak zgloszen oczekujacych.</p>
      ) : (
        <ul className="status-list">
          {reviews.map((review) => (
            <li key={review.submission.id}>
              <AdminReviewItem review={review} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function AdminReviewItem({
  review
}: {
  review: PendingSubmissionReview;
}) {
  return (
    <article className="review-item">
      <h2>{review.quest.title}</h2>
      <p>
        {review.team.name} | {review.submission.contributorName}
      </p>
      <p>{new Date(review.submission.submittedAt).toLocaleString("pl-PL")}</p>
      {review.submission.note ? <p>{review.submission.note}</p> : null}
      <p>
        Postep mapy: {review.map.revealedFragmentCount}/
        {review.map.requiredApprovalCount}
      </p>
      <ProofValue
        proofKind={review.submission.proofKind}
        proofValue={review.submission.proofValue}
      />
      <Link href={`/admin/submissions/${review.submission.id}`}>Szczegoly</Link>
      <ReviewActionForms submissionId={review.submission.id} />
    </article>
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
      <p>
        Dowod:{" "}
        <a href={proofValue} target="_blank" rel="noreferrer noopener">
          Otworz link
        </a>
      </p>
    );
  }

  return <p>Dowod: {proofValue}</p>;
}

export function ReviewActionForms({ submissionId }: { submissionId: string }) {
  return (
    <div className="review-actions">
      <form action="/admin/review" method="post">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="action" value="approve" />
        <button type="submit">Zatwierdz</button>
      </form>
      <form action="/admin/review" method="post" className="stacked-form">
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="action" value="reject" />
        <label htmlFor={`reason-${submissionId}`}>Powod odrzucenia</label>
        <select id={`reason-${submissionId}`} name="reason" required>
          <option value="wrong_proof">Zly dowod</option>
          <option value="link_inaccessible">Link nie dziala</option>
          <option value="quest_incomplete">Misja nieukonczona</option>
          <option value="other">Inny powod</option>
        </select>
        <label htmlFor={`message-${submissionId}`}>Wiadomosc dla druzyny</label>
        <textarea id={`message-${submissionId}`} name="message" maxLength={500} />
        <button type="submit">Odrzuc</button>
      </form>
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
