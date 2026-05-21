import { requireAdmin } from "@/app/admin-session";
import { AdminReviewList } from "@/components/admin/AdminReviewList";
import { getRuntimeRepository } from "@/lib/runtime";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin("/admin");
  const query = await searchParams;
  const error =
    query?.error === "invalid" ? "Nie udalo sie wykonac akcji." : undefined;
  const reviews = await getRuntimeRepository().listPendingSubmissions();

  return <AdminReviewList reviews={reviews} error={error} />;
}
