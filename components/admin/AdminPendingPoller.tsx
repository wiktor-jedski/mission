"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PendingSubmissionReview } from "@/lib/runtime/repository";

export const PENDING_POLL_INTERVAL_MS = 4000;

type PendingPayload = {
  reviews: readonly PendingSubmissionReview[];
};

type AdminPendingPollerProps = {
  initialReviews: readonly PendingSubmissionReview[];
};

export function AdminPendingPoller({
  initialReviews
}: AdminPendingPollerProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [state, setState] = useState<"ready" | "refreshing" | "stale">("ready");

  useEffect(() => {
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      setState("refreshing");
      try {
        const response = await fetch("/admin/pending.json", {
          headers: { accept: "application/json" }
        });
        if (!response.ok) {
          throw new Error("Polling failed.");
        }
        const payload = (await response.json()) as PendingPayload;
        if (active) {
          setReviews(payload.reviews);
          setState("ready");
        }
      } catch {
        if (active) {
          setState("stale");
        }
      }
    };
    const interval = window.setInterval(refresh, PENDING_POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <>
      {state === "refreshing" ? <p role="status">Odswiezam zgloszenia.</p> : null}
      {state === "stale" ? (
        <p role="alert">Nie udalo sie odswiezyc listy. Pokazuje ostatnie dane.</p>
      ) : null}
      <PolledReviewList reviews={reviews} />
    </>
  );
}

function PolledReviewList({
  reviews
}: {
  reviews: readonly PendingSubmissionReview[];
}) {
  if (reviews.length === 0) {
    return <p>Brak zgloszen oczekujacych.</p>;
  }

  return (
    <ul className="status-list">
      {reviews.map((review) => (
        <li key={review.submission.id}>
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
            <PolledProofValue
              proofKind={review.submission.proofKind}
              proofValue={review.submission.proofValue}
            />
            <Link href={`/admin/submissions/${review.submission.id}`}>Szczegoly</Link>
            <PolledReviewActionForms submissionId={review.submission.id} />
          </article>
        </li>
      ))}
    </ul>
  );
}

function PolledProofValue({
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

function PolledReviewActionForms({ submissionId }: { submissionId: string }) {
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
