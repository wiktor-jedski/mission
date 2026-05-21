"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
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
    <div style={{ marginTop: "1.5rem" }}>
      {state === "refreshing" ? (
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--border-glow)", animation: "pulse-glow 1.5s infinite" }}></span>
          <span role="status">{PL_DICTIONARY.admin.refreshing}</span>
        </div>
      ) : null}
      
      {state === "stale" ? (
        <div role="alert" style={{ marginBottom: "1rem" }}>
          {PL_DICTIONARY.admin.staleAlert}
        </div>
      ) : null}
      
      <PolledReviewList reviews={reviews} />
    </div>
  );
}

function PolledReviewList({
  reviews
}: {
  reviews: readonly PendingSubmissionReview[];
}) {
  if (reviews.length === 0) {
    return (
      <div className="panel-rugged" style={{ textAlign: "center", opacity: 0.8 }}>
        <p style={{ margin: 0, fontStyle: "italic", color: "var(--text-muted)" }}>
          {PL_DICTIONARY.admin.noPending}
        </p>
      </div>
    );
  }

  return (
    <ul className="status-list">
      {reviews.map((review) => (
        <li key={review.submission.id}>
          <article className="review-item">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "var(--text-gold)", margin: 0, border: "none", padding: 0 }}>
                {review.quest.title}
              </h2>
              <span 
                role="status"
                style={{ 
                  backgroundColor: "var(--color-pending-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--color-pending)",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "3px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap"
                }}
              >
                Oczekuje
              </span>
            </div>
            
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", margin: "0.25rem 0 0.75rem 0" }}>
              Drużyna: <strong style={{ color: "var(--text-primary)" }}>{review.team.name}</strong> | Autor: <strong style={{ color: "var(--text-primary)" }}>{review.submission.contributorName}</strong>
            </p>
            
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Dodano: {new Date(review.submission.submittedAt).toLocaleString("pl-PL")}
            </p>
            
            {review.submission.note ? (
              <div style={{ padding: "0.75rem 1rem", backgroundColor: "var(--bg-well)", borderRadius: "4px", border: "1px solid var(--border-color)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "bold", marginBottom: "0.25rem" }}>
                  Notatka od gracza:
                </span>
                {review.submission.note}
              </div>
            ) : null}
            
            <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              Postęp mapy zespołu: <strong>{review.map.revealedFragmentCount} / {review.map.requiredApprovalCount}</strong>
            </p>
            
            <div style={{ padding: "1rem", backgroundColor: "var(--bg-well)", borderRadius: "4px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
              <PolledProofValue
                proofKind={review.submission.proofKind}
                proofValue={review.submission.proofValue}
              />
            </div>
            
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
              <Link href={`/admin/submissions/${review.submission.id}`} style={{ fontFamily: "var(--font-serif)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.9rem" }}>
                → {PL_DICTIONARY.admin.detailsBtn}
              </Link>
            </div>
            
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
      <p style={{ margin: 0 }}>
        <strong>{PL_DICTIONARY.admin.proofLabel}:</strong>{" "}
        <a href={proofValue} target="_blank" rel="noreferrer noopener" style={{ textDecoration: "underline", color: "var(--text-gold)" }}>
          Otwórz link do dowodu
        </a>
      </p>
    );
  }

  return (
    <p style={{ margin: 0 }}>
      <strong>{PL_DICTIONARY.admin.proofLabel}:</strong> <span style={{ wordBreak: "break-all" }}>{proofValue}</span>
    </p>
  );
}

function PolledReviewActionForms({ submissionId }: { submissionId: string }) {
  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
      <div>
        <form action="/admin/review" method="post">
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="action" value="approve" />
          <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #3f7a3a 0%, #204d1d 100%)", borderColor: "#559e4e" }}>
            ✓ {PL_DICTIONARY.admin.approveBtn}
          </button>
        </form>
      </div>
      
      <div style={{ marginTop: "0.5rem" }}>
        <form action="/admin/review" method="post" className="stacked-form" style={{ maxWidth: "100%", margin: 0, padding: "1rem" }}>
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="action" value="reject" />
          
          <label htmlFor={`reason-${submissionId}`}>{PL_DICTIONARY.admin.rejectionReasonLabel}</label>
          <select id={`reason-${submissionId}`} name="reason" required>
            <option value="wrong_proof">Zły dowód</option>
            <option value="link_inaccessible">Link nie działa</option>
            <option value="quest_incomplete">Misja nieukończona</option>
            <option value="other">Inny powód</option>
          </select>
          
          <label htmlFor={`message-${submissionId}`}>{PL_DICTIONARY.admin.rejectionMessageLabel}</label>
          <textarea id={`message-${submissionId}`} name="message" maxLength={500} style={{ minHeight: "3.5rem" }} />
          
          <button type="submit" style={{ background: "linear-gradient(135deg, #a63a3a 0%, #5d1717 100%)", borderColor: "#d14b4b" }}>
            ✗ {PL_DICTIONARY.admin.rejectBtn}
          </button>
        </form>
      </div>
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
