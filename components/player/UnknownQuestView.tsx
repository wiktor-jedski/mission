import Link from "next/link";

export function UnknownQuestView() {
  return (
    <main className="page-shell">
      <h1>Misja niedostepna</h1>
      <p>Ten kod nie prowadzi do aktywnej misji.</p>
      <Link href="/">Wroc do startu</Link>
    </main>
  );
}
