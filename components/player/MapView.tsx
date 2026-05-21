import Link from "next/link";
import type { MapProgressSnapshot } from "@/lib/domain/types";

type MapViewProps = {
  map: MapProgressSnapshot;
};

export function MapView({ map }: MapViewProps) {
  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">Start</Link>
        <Link href="/submissions">Zgloszenia</Link>
        <Link href="/logout">Wyloguj</Link>
      </nav>
      <h1>Mapa skarbu</h1>
      <p role="status">
        Odkryte fragmenty: {map.revealedFragmentCount}/
        {map.requiredApprovalCount}
      </p>
      {map.isFinalUnlocked ? (
        <section aria-labelledby="final-prize-heading">
          <h2 id="final-prize-heading">Finalny skarb</h2>
          <a href="/final-prize-photo.jpg">Otworz zdjecie finalnej nagrody</a>
        </section>
      ) : (
        <p>Finalny skarb jest jeszcze zablokowany.</p>
      )}
    </main>
  );
}
