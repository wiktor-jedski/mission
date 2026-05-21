import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";

export function UnknownQuestView() {
  return (
    <main className="page-shell">
      <div className="panel-rugged" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <h1 style={{ border: "none", margin: 0, color: "var(--color-error)", fontSize: "2rem" }}>
          {PL_DICTIONARY.quest.unknownTitle}
        </h1>
        <p style={{ margin: "1.5rem 0", color: "var(--text-muted)", fontSize: "1.1rem" }}>
          {PL_DICTIONARY.quest.unknownMessage}
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/" className="btn-tactile">
            {PL_DICTIONARY.quest.backToStart}
          </Link>
        </div>
      </div>
    </main>
  );
}
