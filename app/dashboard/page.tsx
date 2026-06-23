import { redirect } from "next/navigation"
import { getWho, homeForRole } from "@/app/lib/portal"

/**
 * Post-login router. Magic-link auth only proves which email you are; whoami()
 * turns that into a role (and binds the account), and we forward to the right
 * console. Reviewers and first-time users both land on /portal.
 */
export default async function DashboardPage() {
  const { user, who } = await getWho()
  if (!user) redirect("/login")
  redirect(homeForRole(who?.role))
}
