import Link from "next/link";

type PlayerHomeProps = {
  teamName?: string;
};

export function PlayerHome({ teamName }: PlayerHomeProps) {
  return (
    <main className="page-shell">
      <h1>Mission Treasure Hunt</h1>
      {teamName ? (
        <>
          <p>Jestes zalogowany jako {teamName}.</p>
          <nav className="inline-nav" aria-label="Nawigacja gracza">
            <Link href="/map">Mapa</Link>
            <Link href="/submissions">Zgloszenia</Link>
            <a href="/logout">Wyloguj</a>
          </nav>
        </>
      ) : (
        <Link href="/login">Zaloguj druzyne</Link>
      )}
    </main>
  );
}
