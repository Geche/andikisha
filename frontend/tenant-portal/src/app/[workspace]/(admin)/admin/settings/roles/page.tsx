import { redirect } from "next/navigation";

// R2-10: the roles/users surface moved to the top-level /admin/users (one home for
// user management). This path redirects so existing links keep working.
export default async function RolesRedirect({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  redirect(`/${workspace}/admin/users`);
}
