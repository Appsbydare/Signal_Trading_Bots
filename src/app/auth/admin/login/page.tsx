import { redirect } from "next/navigation";

/** Legacy URL: middleware used to send users here; forward to the real admin login page. */
export default async function LegacyAdminLoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    redirect(`/admin/login?from=${encodeURIComponent(from)}`);
  }
  redirect("/admin/login");
}
