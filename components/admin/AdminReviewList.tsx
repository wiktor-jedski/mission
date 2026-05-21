import Link from "next/link";
import { AdminPendingPoller } from "./AdminPendingPoller";
import type { PendingSubmissionReview } from "@/lib/runtime/repository";
import type { Quest, Team } from "@/lib/domain/types";

type AdminReviewListProps = {
  reviews: readonly PendingSubmissionReview[];
  teams?: readonly Team[];
  quests?: readonly Quest[];
  error?: string;
};

export function AdminReviewList({
  reviews,
  teams = [],
  quests = [],
  error
}: AdminReviewListProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja admina">
        <Link href="/admin">Zgloszenia</Link>
        <Link href="/admin/audit">Audyt</Link>
        <a href="/admin/logout">Wyloguj</a>
      </nav>
      <h1>Zgloszenia do sprawdzenia</h1>
      {error ? <p role="alert">{error}</p> : null}
      <AdminOverrideForms teams={teams} quests={quests} />
      <AdminPendingPoller initialReviews={reviews} />
    </main>
  );
}

export function AdminOverrideForms({
  teams,
  quests
}: {
  teams: readonly Team[];
  quests: readonly Quest[];
}) {
  if (teams.length === 0 || quests.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="override-heading">
      <h2 id="override-heading">Narzedzia admina</h2>
      <form action="/admin/overrides" method="post" className="stacked-form">
        <input type="hidden" name="action" value="reveal" />
        <TeamSelect teams={teams} id="reveal-team" />
        <button type="submit">Odkryj fragment</button>
      </form>
      <form action="/admin/overrides" method="post" className="stacked-form">
        <input type="hidden" name="action" value="hide" />
        <TeamSelect teams={teams} id="hide-team" />
        <ReasonInput id="hide-reason" />
        <button type="submit">Ukryj fragment</button>
      </form>
      <form action="/admin/overrides" method="post" className="stacked-form">
        <input type="hidden" name="action" value="skip" />
        <TeamSelect teams={teams} id="skip-team" />
        <QuestSelect quests={quests} id="skip-quest" />
        <ReasonInput id="skip-reason" />
        <button type="submit">Pomin misje</button>
      </form>
      <form action="/admin/overrides" method="post" className="stacked-form">
        <input type="hidden" name="action" value="override" />
        <TeamSelect teams={teams} id="override-team" />
        <QuestSelect quests={quests} id="override-quest" />
        <ReasonInput id="override-reason" />
        <button type="submit">Zalicz awarie misji</button>
      </form>
      <form action="/admin/overrides" method="post" className="stacked-form">
        <input type="hidden" name="action" value="replacement" />
        <TeamSelect teams={teams} id="replacement-team" />
        <QuestSelect quests={quests} id="replacement-quest" />
        <label htmlFor="replacement-contributor">Autor dowodu</label>
        <input id="replacement-contributor" name="contributorName" required />
        <label htmlFor="replacement-kind">Typ dowodu</label>
        <select id="replacement-kind" name="proofKind" required>
          <option value="photo_link">Link do zdjecia</option>
          <option value="video_link">Link do filmu</option>
          <option value="audio_link">Link do audio</option>
          <option value="text_response">Odpowiedz tekstowa</option>
        </select>
        <label htmlFor="replacement-proof">Dowod</label>
        <textarea id="replacement-proof" name="proofValue" required />
        <label htmlFor="replacement-note">Notatka</label>
        <textarea id="replacement-note" name="note" maxLength={500} />
        <label htmlFor="replacement-status">Status</label>
        <select id="replacement-status" name="status" required>
          <option value="pending">Do sprawdzenia</option>
          <option value="approved">Zaakceptowany</option>
        </select>
        <button type="submit">Dodaj dowod zastepczy</button>
      </form>
    </section>
  );
}

function TeamSelect({ teams, id }: { teams: readonly Team[]; id: string }) {
  return (
    <>
      <label htmlFor={id}>Druzyna</label>
      <select id={id} name="teamId" required>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </>
  );
}

function QuestSelect({ quests, id }: { quests: readonly Quest[]; id: string }) {
  return (
    <>
      <label htmlFor={id}>Misja</label>
      <select id={id} name="questId" required>
        {quests.map((quest) => (
          <option key={quest.id} value={quest.id}>
            {quest.title}
          </option>
        ))}
      </select>
    </>
  );
}

function ReasonInput({ id }: { id: string }) {
  return (
    <>
      <label htmlFor={id}>Powod</label>
      <textarea id={id} name="reason" required maxLength={300} />
    </>
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
