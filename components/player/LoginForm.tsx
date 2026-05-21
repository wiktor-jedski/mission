type LoginFormProps = {
  error?: string;
  nextPath?: string;
};

export function LoginForm({ error, nextPath = "/" }: LoginFormProps) {
  return (
    <main className="page-shell">
      <h1>Wejscie do misji</h1>
      <form action="/login/submit" method="post" className="stacked-form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="team-pin">PIN druzyny</label>
        <input
          id="team-pin"
          name="pin"
          type="password"
          autoComplete="off"
          required
        />
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">Wejdz</button>
      </form>
    </main>
  );
}
