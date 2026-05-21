type AdminLoginFormProps = {
  error?: string;
  nextPath: string;
};

export function AdminLoginForm({ error, nextPath }: AdminLoginFormProps) {
  return (
    <main className="page-shell">
      <h1>Panel admina</h1>
      <form action="/admin/login/submit" method="post" className="stacked-form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="admin-password">Haslo admina</label>
        <input id="admin-password" name="password" type="password" required />
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">Zaloguj</button>
      </form>
    </main>
  );
}
