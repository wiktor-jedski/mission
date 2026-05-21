import { PL_DICTIONARY } from "@/lib/player/copy-dictionary";

type LoginFormProps = {
  error?: string;
  nextPath?: string;
};

export function LoginForm({ error, nextPath = "/" }: LoginFormProps) {
  return (
    <main className="page-shell">
      <h1>{PL_DICTIONARY.login.title}</h1>
      <form action="/login/submit" method="post" className="stacked-form">
        <input type="hidden" name="next" value={nextPath} />
        <label htmlFor="team-pin">{PL_DICTIONARY.login.pinLabel}</label>
        <input
          id="team-pin"
          name="pin"
          type="password"
          autoComplete="off"
          required
        />
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">{PL_DICTIONARY.login.submitButton}</button>
      </form>
    </main>
  );
}
