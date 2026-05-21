import { LoginForm } from "@/components/player/LoginForm";
import { normalizePlayerRedirect } from "@/lib/player/session";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error === "invalid" ? "Nieprawidłowy PIN." : undefined;
  const nextPath = normalizePlayerRedirect(
    singleValue(params?.next),
    "/"
  );

  return <LoginForm error={error} nextPath={nextPath} />;
}

const singleValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;
