import { getMentorConversationsAction } from "@/lib/api/mentor-conversations-actions";
import { MessagesPanel } from "@/components/features/dashboard-mentor/MessagesPanel";

export default async function MentorMesajePage() {
  const conversationsRes = await getMentorConversationsAction();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Mesaje
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conversații cu organizațiile pe care le supervizezi.
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
