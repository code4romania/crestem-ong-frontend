
function formatJoinDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function ProfileHeaderCard({
  nume,
  email,
  createdAt,
}: {
  nume: string;
  email: string;
  createdAt: string;
}) {
  const initials = nume
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-border p-6 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: "#00d495" }}
          >
            {initials}
          </div>
          <div>
            <p className="font-heading font-bold text-lg" style={{ color: "#1c1c81" }}>
              {nume}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "#5b6779" }}>
              {email}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Membru din{" "}
              <span className="font-semibold" style={{ color: "#1c1c81" }}>
                {formatJoinDate(createdAt)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
