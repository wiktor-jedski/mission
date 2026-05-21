import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import { EffectSettings } from "@/components/player/EffectSettings";

type PlayerHomeProps = {
  teamName?: string;
};

export default function PlayerHomeComponent({ teamName }: PlayerHomeProps) {
  return (
    <main className="page-shell">
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p className="eyebrow">{PL_DICTIONARY.home.title}</p>
        <h1>{PL_DICTIONARY.home.subtitle}</h1>
      </div>
      
      {teamName ? (
        <div className="panel-rugged" style={{ textAlign: "center", gap: "1.25rem" }}>
          <p style={{ fontSize: "1.1rem" }}>
            {PL_DICTIONARY.home.loggedInAs} <strong>{teamName}</strong>.
          </p>
          <nav className="inline-nav" aria-label="Nawigacja gracza" style={{ justifyContent: "center", margin: "1rem 0 0 0" }}>
            <Link href="/map">{PL_DICTIONARY.nav.map}</Link>
            <Link href="/submissions">{PL_DICTIONARY.nav.submissions}</Link>
            <a href="/logout">{PL_DICTIONARY.nav.logout}</a>
          </nav>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
          <Link href="/login" className="btn-tactile">
            {PL_DICTIONARY.nav.login}
          </Link>
        </div>
      )}

      <div style={{ marginTop: "3rem" }}>
        <EffectSettings />
      </div>
    </main>
  );
}

export { PlayerHomeComponent as PlayerHome };
