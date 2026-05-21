import { requireAdmin } from "@/app/admin-session";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { getRuntimeRepository } from "@/lib/runtime";

export default async function AdminAuditPage() {
  await requireAdmin("/admin/audit");
  const entries = await getRuntimeRepository().listAuditLogs();
  return <AdminAuditLog entries={entries} />;
}
