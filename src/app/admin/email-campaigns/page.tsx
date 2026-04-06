import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth-server";
import { EmailCampaignsAdminClient } from "@/components/admin/EmailCampaignsAdminClient";

export default async function AdminEmailCampaignsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return <EmailCampaignsAdminClient adminEmail={admin.email} />;
}
