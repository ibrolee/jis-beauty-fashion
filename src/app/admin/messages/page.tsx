import { requireAdmin } from "@/lib/auth/session";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers } from "@/db/schema";
import { ActionButton, AdminPageHeader, Card } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { markContactReadAction } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  await requireAdmin(); // defense in depth: pages render in parallel with the layout
  const [messages, subscribers] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(500),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Messages" description="Contact form submissions and newsletter subscribers." />
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {messages.length === 0 && <p className="border border-line bg-white p-6 text-sm text-stone">No messages yet.</p>}
          {messages.map((m) => (
            <article key={m.id} className="border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{m.name} {!m.isRead && <Badge tone="new" className="ml-1">New</Badge>}</p>
                  <p className="text-xs text-stone">
                    <a href={`mailto:${m.email}`} className="underline-offset-4 hover:underline">{m.email}</a>{m.phone ? ` · ${m.phone}` : ""} · {formatDate(m.createdAt, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!m.isRead && <ActionButton action={markContactReadAction.bind(null, m.id)}>Mark read</ActionButton>}
              </div>
              {m.subject && <p className="mt-3 text-sm font-medium">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{m.message}</p>
            </article>
          ))}
        </div>
        <Card title={`Newsletter subscribers (${subscribers.length})`}>
          {subscribers.length === 0 ? (
            <p className="text-sm text-stone">No subscribers yet.</p>
          ) : (
            <ul className="max-h-[520px] space-y-2 overflow-y-auto text-sm">
              {subscribers.map((s) => (
                <li key={s.id} className="flex justify-between gap-3">
                  <span className="truncate">{s.email}</span>
                  <span className="shrink-0 text-xs text-stone">{formatDate(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
