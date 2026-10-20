import { redirect } from "next/navigation";
import { ROLE_SYNC_PATH } from "@/lib/dashboard-routes";
import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { PageTransition } from "@/components/ui/PageTransition";

export default async function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/autentificare");
  }
  if (!user) {
    redirect("/autentificare");
  }
  if (user.role?.type !== "ngo-member") {
    redirect(ROLE_SYNC_PATH);
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={userDisplayName(user)} userEmail={user.email} variant="member" />
      <main
        className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8"
        style={{ background: "#f8fafc" }}
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
