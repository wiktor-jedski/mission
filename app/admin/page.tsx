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
  const repository = getRuntimeRepository();
  const [reviews, teams, quests] = await Promise.all([
    repository.listPendingSubmissions(),
    repository.getTeams(),
    repository.getQuests()
  ]);

  return <AdminReviewList reviews={reviews} teams={teams} quests={quests} error={error} />;
}
