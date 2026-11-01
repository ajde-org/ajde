"use client";

import { startTransition, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/provider";

import { formatDateTime, formatNumber, plural } from "@/lib/i18n/format";
import Link from "next/link";
import { ContactDetails } from "@/components/contact-details";
import { loadRoom, sendRoomMessage } from "@/lib/chat/actions";
import { isRoomEvent, mergeMessages, type Cursor, type Member, type Message, type RoomPage } from "@/lib/chat/contract";
import { createClient } from "@/lib/supabase/client";
import { ChatAiPanel } from "./ai-panel";

export function ParticipantRoster({ members }: { members: Member[] }) {
  const { t } = useI18n();
  return <ul aria-label={t("chat.participantsLabel")} className="flex gap-2 lg:flex-col">
    {members.map(member => <li key={member.id} className="w-60 shrink-0 rounded-xl bg-slate-50 p-3 text-sm lg:w-auto">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={member.photo_url} alt="" className="size-8 shrink-0 rounded-full object-cover" />
        <span className="min-w-0 break-words font-medium">{member.full_name}{member.isDriver ? t("chat.driver") : ""}</span>
      </div>
      <ContactDetails phone={member.phone} socialUrl={member.social_url} instagram={member.instagram} facebook={member.facebook} />
    </li>)}
  </ul>;
}

export function MessageList({ messages, viewerId }: { messages: Message[]; viewerId: string }) {
  const { locale, t } = useI18n();
  if (!messages.length) return <p className="p-6 text-center text-slate-500">{t("chat.empty")}</p>;
  return <ol aria-label={t("chat.messagesLabel")} className="space-y-3 p-4 sm:p-5">
    {messages.map(message => <li key={message.id} className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 ${message.sender_id === viewerId ? "ml-auto rounded-br-md bg-brand-50" : "rounded-bl-md bg-slate-100"}`}>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {message.sender?.photo_url ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={message.sender.photo_url} alt="" className="size-6 rounded-full object-cover" />
        </> : null}
        <span className="font-semibold">{message.sender?.full_name ?? t("chat.former")}</span>
        <time dateTime={message.created_at}>{formatDateTime(locale, message.created_at, { dateStyle: "short", timeStyle: "short" })}</time>
      </div>
      <p className="mt-2 whitespace-pre-wrap [overflow-wrap:anywhere]">{message.body}</p>
    </li>)}
  </ol>;
}

export function RideRoom({ rideId, initial, aiEnabled }: { rideId: string; initial: RoomPage; aiEnabled: boolean }) {
  return <RideRoomSession key={`${rideId}:${initial.viewerId}`} rideId={rideId} initial={initial} aiEnabled={aiEnabled} />;
}

function RideRoomSession({ rideId, initial, aiEnabled }: { rideId: string; initial: RoomPage; aiEnabled: boolean }) {
  const { locale, t, notice } = useI18n();
  const [messages, setMessages] = useState(initial.messages);
  const messagesRef = useRef(initial.messages);
  const [members, setMembers] = useState(initial.members);
  const [membership, setMembership] = useState(initial.membership);
  const [olderCursor, setOlderCursor] = useState(initial.nextCursor);
  const [unavailable, setUnavailable] = useState(false);
  const [status, setStatus] = useState("chat.connecting");
  const [retry, setRetry] = useState(0);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState(0);
  const [pending, sendTransition] = useTransition();
  const [loadingOlder, historyTransition] = useTransition();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const prependHeight = useRef<number | null>(null);
  const live = useRef(true);
  const restoreFocus = useRef(false);

  function loseAccess() {
    messagesRef.current = [];
    setMessages([]); setMembers([]); setBody(""); setUnavailable(true);
  }

  useEffect(() => {
    if (!pending && restoreFocus.current) {
      restoreFocus.current = false;
      textarea.current?.focus();
    }
  }, [pending]);

  function receive(incoming: Message[]) {
    const merged = mergeMessages(messagesRef.current, incoming);
    const added = merged.length - messagesRef.current.length;
    messagesRef.current = merged;
    setMessages(merged);
    if (added) setAnnouncement(added);
  }

  useLayoutEffect(() => {
    const node = timeline.current;
    if (!node) return;
    if (prependHeight.current !== null) {
      node.scrollTop += node.scrollHeight - prependHeight.current;
      prependHeight.current = null;
    } else if (nearBottom.current) node.scrollTop = node.scrollHeight;
  }, [messages]);

  useEffect(() => {
    live.current = true;
    return () => { live.current = false; };
  }, []);

  useEffect(() => {
    if (unavailable) return;
    const client = createClient();
    let active = true;
    let refreshing = false;
    let refreshAgain = false;
    let connected = false;
    let offlineNow = !navigator.onLine;
    const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
      if (active && (event === "SIGNED_OUT" || (session && session.user.id !== initial.viewerId))) {
        active = false;
        messagesRef.current = [];
        setMessages([]); setMembers([]); setBody(""); setUnavailable(true);
      }
    });

    async function synchronize() {
      if (!active || offlineNow) return;
      if (refreshing) { refreshAgain = true; return; }
      refreshing = true;
      try {
        do {
          refreshAgain = false;
          const latest = messagesRef.current.at(-1);
          let cursor: Cursor | null = latest ? { id: latest.id, created_at: latest.created_at } : null;
          do {
            const result = await loadRoom({ rideId, cursor, direction: "newer" });
            if (!active) return;
            if (!result.ok) {
              if (result.code === "unavailable") {
                active = false;
                messagesRef.current = [];
                setMessages([]); setMembers([]); setUnavailable(true);
              } else setStatus("chat.reconnect");
              return;
            }
            setMembership(result.value.membership);
            setMembers(result.value.members);
            receive(result.value.messages);
            const hadCursor = cursor !== null;
            if (!hadCursor && result.value.nextCursor) setOlderCursor(result.value.nextCursor);
            cursor = hadCursor ? result.value.nextCursor : null;
          } while (cursor && active);
          if (active) setStatus(offlineNow ? "chat.offline" : connected ? "chat.connected" : "chat.reconnecting");
        } while (refreshAgain && active);
      } catch { if (active) setStatus("chat.offline"); }
      finally { refreshing = false; }
    }
    const refresh = () => startTransition(() => { void synchronize(); });
    // A distinct channel instance prevents an asynchronous cleanup from closing a
    // replacement subscription (including React's development effect remount).
    const channel = client.channel(`ride-room:${rideId}:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `ride_id=eq.${rideId}` }, payload => {
        // Re-fetch through the authorized history query instead of trusting event data.
        if (active && isRoomEvent(payload.new, rideId)) refresh();
      });
    async function subscribe() {
      try {
        // Wait for the cookie-backed session before joining an RLS-protected feed.
        const { data: { session } } = await client.auth.getSession();
        if (!active) return;
        if (!session) { setUnavailable(true); messagesRef.current = []; setMessages([]); setMembers([]); setBody(""); return; }
        await client.realtime.setAuth(session.access_token);
        if (!active) return;
        channel.subscribe(state => {
        if (!active) return;
        connected = state === "SUBSCRIBED";
        setStatus(connected ? "chat.connected" : "chat.reconnecting");
        if (connected) refresh();
        });
      } catch { if (active) setStatus("chat.reconnect"); }
    }
    void subscribe();
    const timer = window.setInterval(refresh, 15000);
    const offline = () => { offlineNow = true; connected = false; setStatus("chat.offline"); };
    const online = () => setRetry(value => value + 1);
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    window.addEventListener("focus", refresh);
    refresh();
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
      window.removeEventListener("focus", refresh);
      void client.removeChannel(channel);
      authListener.subscription.unsubscribe();
    };
  }, [rideId, retry, unavailable, initial.viewerId]);

  function send() {
    if (pending || !body.trim() || !membership.canSend || unavailable) return;
    setError("");
    restoreFocus.current = true;
    sendTransition(async () => {
      try {
        const result = await sendRoomMessage({ rideId, body });
        if (!live.current) return;
        if (!result.ok) {
          setError(`chat.error.${result.code}`);
          if (result.code === "unavailable") { messagesRef.current = []; setMessages([]); setMembers([]); setUnavailable(true); }
          if (result.code === "closed") setMembership(value => ({ ...value, canSend: false }));
          return;
        }
        receive([result.value]); setBody("");
      } catch { if (live.current) setError("chat.sendFailed"); }
    });
  }
  function older() {
    if (!olderCursor || loadingOlder) return;
    setError("");
    historyTransition(async () => {
      try {
        const result = await loadRoom({ rideId, cursor: olderCursor, direction: "older" });
        if (!live.current) return;
        if (!result.ok) {
          setError(`chat.error.${result.code}`);
          if (result.code === "unavailable") { messagesRef.current = []; setMessages([]); setMembers([]); setUnavailable(true); }
          return;
        }
        prependHeight.current = timeline.current?.scrollHeight ?? null;
        const merged = mergeMessages(messagesRef.current, result.value.messages);
        messagesRef.current = merged; setMessages(merged); setOlderCursor(result.value.nextCursor);
        setMembers(result.value.members); setMembership(result.value.membership);
      } catch { if (live.current) setError("chat.historyFailed"); }
    });
  }

  if (unavailable) return <section role="status" className="surface-card p-8"><h1 className="font-display text-2xl font-extrabold tracking-[-.03em]">{t("chat.unavailableTitle")}</h1><p className="mt-2 text-slate-600">{t("chat.noAccess")}</p><Link className="btn-primary mt-5" href="/rides">{t("chat.find")}</Link></section>;
  const connected = status === "chat.connected";
  // Fills the viewport below the navbar: the sidebar (a strip on small screens) sits beside
  // the conversation, and only the message history scrolls.
  return <section className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5">
    <aside className="surface-card order-first flex shrink-0 flex-col gap-3 p-3 sm:p-4 lg:order-last lg:gap-5 lg:overflow-y-auto lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{t("chat.participants", { count: formatNumber(locale, members.length) })}</p>
        <Link className="text-sm font-semibold text-brand-700 hover:underline lg:hidden" href={`/rides/${rideId}`}>{t("chat.details")}</Link>
      </div>
      <div className="-mx-1 overflow-x-auto px-1 lg:mx-0 lg:overflow-visible lg:px-0"><ParticipantRoster members={members} /></div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className={`size-2 shrink-0 rounded-full ${connected ? "bg-brand-500" : "bg-amber-500"}`} aria-hidden="true" />
        <span role="status" className="font-medium">{notice(status, "chat.reconnect")}</span>
        <button type="button" className="min-h-0 font-semibold text-brand-700 underline" onClick={() => setRetry(value => value + 1)}>{t("chat.retry")}</button>
      </div>
      <p className="text-sm leading-6 text-slate-600">{t("chat.privacy")}</p>
      <Link className="btn-secondary hidden lg:inline-flex" href={`/rides/${rideId}`}>{t("chat.details")}</Link>
    </aside>

    <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5">
          <h1 className="font-display text-xl font-extrabold tracking-[-.03em]">{t("chat.title")}</h1>
          <span className="text-xs text-slate-500">{t(`chat.count.${plural(locale, messages.length)}`, { count: formatNumber(locale, messages.length) })}</span>
        </div>
        {aiEnabled ? <ChatAiPanel rideId={rideId} latest={messages.at(-1) ?? null} onUnavailable={loseAccess} /> : null}
      </header>
      <div ref={timeline} tabIndex={0} aria-label={t("chat.history")} className="h-64 flex-none overflow-y-auto overscroll-contain lg:h-auto lg:min-h-20 lg:flex-1" onScroll={() => {
        const node = timeline.current;
        if (node) nearBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
      }}>
        {olderCursor ? <button type="button" disabled={loadingOlder} onClick={older} className="mx-auto block min-h-0 p-3 text-sm font-semibold text-brand-700 disabled:opacity-50">{loadingOlder ? t("chat.loadingOlder") : t("chat.loadOlder")}</button> : null}
        <MessageList messages={messages} viewerId={initial.viewerId} />
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">{announcement ? t(`chat.new.${plural(locale, announcement)}`, { count: formatNumber(locale, announcement) }) : ""}</p>
      <form className="shrink-0 space-y-2 border-t border-slate-100 p-3 sm:p-4" onSubmit={event => { event.preventDefault(); send(); }}>
        {!membership.canSend ? <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm">{t("chat.readOnly")}</p> : null}
        <label htmlFor="room-message" className="sr-only">{t("chat.label")}</label>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <textarea id="room-message" ref={textarea} value={body} onChange={event => setBody(event.target.value)} maxLength={2000} rows={2} placeholder={t("chat.placeholder")}
            disabled={pending || !membership.canSend} aria-describedby="room-keyboard" className="field max-h-40 min-h-[52px] flex-1 resize-none disabled:bg-slate-100"
            onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} />
          <button disabled={pending || !body.trim() || !membership.canSend} className="btn-primary shrink-0 px-4 disabled:opacity-50">{pending ? t("chat.sending") : t("chat.send")}</button>
        </div>
        <p id="room-keyboard" className="text-xs text-slate-500">{t("chat.keyboard", { count: formatNumber(locale, body.length) })}</p>
        {error ? <p role="alert" className="text-sm text-red-700">{notice(error, "chat.error.database")}</p> : null}
      </form>
    </div>
  </section>;
}
