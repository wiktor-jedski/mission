import Link from "next/link";
import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";
import type { MapProgressSnapshot } from "@/lib/domain/types";

type MapViewProps = {
  map: MapProgressSnapshot;
};

export function MapView({ map }: MapViewProps) {
  const totalFragments = map.requiredApprovalCount || 21;
  const fragments = Array.from({ length: totalFragments }, (_, i) => i + 1);

  return (
    <main className="page-shell">
      <nav className="inline-nav" aria-label="Nawigacja gracza">
        <Link href="/">{PL_DICTIONARY.nav.start}</Link>
        <Link href="/submissions">{PL_DICTIONARY.nav.submissions}</Link>
        <a href="/logout">{PL_DICTIONARY.nav.logout}</a>
      </nav>
      
      <h1>{PL_DICTIONARY.map.title}</h1>
      
      <div className="panel-rugged" style={{ marginBottom: "2rem", textAlign: "center" }}>
        <p className="eyebrow">{PL_DICTIONARY.map.progressLabel}</p>
        <p role="status" style={{ fontSize: "2rem", color: "var(--text-gold)", fontWeight: "bold", margin: "0.5rem 0" }}>
          {map.revealedFragmentCount} / {totalFragments}
        </p>
        <div style={{ width: "100%", backgroundColor: "var(--bg-well)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
          <div 
            style={{ 
              width: `${(map.revealedFragmentCount / totalFragments) * 100}%`, 
              backgroundColor: "var(--border-glow)", 
              height: "100%", 
              transition: "width 0.4s ease" 
            }} 
          />
        </div>
      </div>

      <div className="map-grid-container">
        {fragments.map((num) => {
          const isRevealed = num <= map.revealedFragmentCount;
          return (
            <div 
              key={num} 
              className={`map-rune-tile ${isRevealed ? "revealed" : "locked"}`}
              title={isRevealed ? `Fragment ${num} odkryty` : `Fragment ${num} zablokowany`}
            >
              {isRevealed ? (
                <>
                  <span className="check-badge">✓</span>
                  <span className="tile-number">{num}</span>
                </>
              ) : (
                <>
                  <span className="rune-symbol">᚛</span>
                  <span className="tile-number" style={{ fontSize: "0.8rem", opacity: 0.5 }}>{num}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2rem" }}>
        {map.isFinalUnlocked ? (
          <section aria-labelledby="final-prize-heading" className="panel-rugged" style={{ border: "2px solid var(--border-glow)" }}>
            <h2 id="final-prize-heading" style={{ color: "var(--text-gold)" }}>
              {PL_DICTIONARY.map.finalPrizeHeading}
            </h2>
            <p>Gratulacje! Odkryliście pełną mapę i odnaleźliście legendarny skarb!</p>
            <a href="/final-prize-photo.jpg" target="_blank" rel="noopener noreferrer" className="btn-tactile">
              {PL_DICTIONARY.map.openPrizeButton}
            </a>
          </section>
        ) : (
          <div className="panel-rugged" style={{ opacity: 0.85 }}>
            <p style={{ margin: 0, fontStyle: "italic", textAlign: "center", color: "var(--text-muted)" }}>
              {PL_DICTIONARY.map.lockedMessage}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
