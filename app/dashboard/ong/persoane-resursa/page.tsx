import { getConversationsAction } from "@/lib/api/conversations-actions";
import { MessagesPanel } from "@/components/features/dashboard-ong/MessagesPanel";
import { PersoaneResursaTabs } from "@/components/features/dashboard-ong/PersoaneResursaTabs";

export default async function OngPersoaneResursaMesajePage() {
  const conversationsRes = await getConversationsAction();

  return (
    <div>
      <PersoaneResursaTabs active="mesaje" />

      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Mesaje
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversațiile organizației tale legate de evaluări.
        </p>
      </div>

      {conversationsRes.error ? (
        <p className="text-sm" style={{ color: "#b91c1c" }}>
          {conversationsRes.error}
        </p>
      ) : (
        <MessagesPanel initialConversations={conversationsRes.data ?? []} />
      )}
    </div>
  );
}
