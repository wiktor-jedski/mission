import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { normalizeAdminRedirect } from "@/lib/admin/session";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({
  searchParams
}: AdminLoginPageProps) {
  const query = await searchParams;
  const error =
    query?.error === "invalid"
      ? "Nieprawidłowe hasło admina."
      : query?.error === "config"
        ? "Brakuje konfiguracji hasła admina."
        : undefined;
  const rawNext = Array.isArray(query?.next) ? query?.next[0] : query?.next;

  return (
    <AdminLoginForm
      error={error}
      nextPath={normalizeAdminRedirect(rawNext, "/admin")}
    />
  );
}
