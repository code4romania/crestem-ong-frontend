import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ROLE_SYNC_PATH } from "@/lib/dashboard-routes";
import { getCurrentUser } from "@/lib/api/session-server";
import { userDisplayName } from "@/lib/api/auth";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { PageTransition } from "@/components/ui/PageTransition";
import { FirstLoginProfilePrompt } from "@/components/features/dashboard/FirstLoginProfilePrompt";

export default async function OngDashboardLayout({
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
  if (user.role?.type !== "ngo-admin") {
    redirect(ROLE_SYNC_PATH);
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userName={userDisplayName(user)} userEmail={user.email} variant="ong" />
      <main
        className="flex-1 overflow-y-auto p-4 pt-20 lg:p-8"
        style={{ background: "#f8fafc" }}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Suspense fallback={null}>
        <FirstLoginProfilePrompt />
      </Suspense>
    </div>
  );
}
