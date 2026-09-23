import { redirect } from "next/navigation";
import { ROLE_SYNC_PATH } from "@/lib/dashboard-routes";
import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { PageTransition } from "@/components/ui/PageTransition";

export default async function MentorDashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/autentificare");
  }
  if (!user) redirect("/autentificare");
  if (user.role?.type !== "mentor") redirect(ROLE_SYNC_PATH);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={userDisplayName(user)} userEmail={user.email} variant="mentor" />
      <main
        className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8"
        style={{ background: "#f8fafc" }}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
