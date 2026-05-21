import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";

type AdminLoginFormProps = {
  error?: string;
  nextPath: string;
};

export function AdminLoginForm({ error, nextPath }: AdminLoginFormProps) {
  return (
    <main className="page-shell">
      <h1>{PL_DICTIONARY.admin.loginTitle}</h1>
      <form action="/admin/login/submit" method="post" className="stacked-form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="admin-password">{PL_DICTIONARY.admin.passwordLabel}</label>
        <input id="admin-password" name="password" type="password" required />
        {error ? <div role="alert">{error}</div> : null}
        <button type="submit">{PL_DICTIONARY.admin.loginButton}</button>
      </form>
    </main>
  );
}
