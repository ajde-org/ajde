// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@/lib/i18n/testing";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ChatAiPanel } from "./ai-panel";
import type { AiAnswer } from "@/lib/chat/ai-contract";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
const rideId = "94000000-0000-4000-8000-000000000001";
const source = { id: "94000000-0000-4000-8000-000000000010", created_at: "2026-09-21T12:00:00.000001Z", author: "Ana", body: "Earlier pickup agreement" };
const answer: AiAnswer = { mode: "summary", insufficientEvidence: false,
  items: [{ category: "decision", text: "Pickup at the station", sources: [source] }], messageCount: 151, cutoff: { id: source.id, created_at: source.created_at } };
const fetcher = vi.fn();
const denied = vi.fn();
// jsdom lacks native dialog methods; browser fixtures cover top-layer behavior.
HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
beforeEach(() => { vi.stubGlobal("matchMedia", () => ({ matches: true })); denied.mockReset(); fetcher.mockReset().mockResolvedValue(Response.json({ ok: true, value: answer })); vi.stubGlobal("fetch", fetcher); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const mount = () => render(<ChatAiPanel rideId={rideId} latest={source} onUnavailable={denied} />);
it.each(["en", "mk"] as const)("warns, blocks, and unlocks chat AI in %s", async locale => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date("2026-11-20T21:00:00Z"));
    const messages = locale === "mk" ? mk : en;
    const retryAt = new Date(Date.now() + 60_000).toISOString();
    const success = { ok: true, value: answer };
    fetcher.mockResolvedValueOnce(Response.json(success, { headers: { "X-AI-Allowance-Full-At": retryAt } }))
      .mockResolvedValueOnce(Response.json(success, { headers: { "X-AI-Next-Action-At": retryAt } }))
      .mockResolvedValueOnce(Response.json({ ok: false, code: "rate_limit", error: "Limit reached", retryAt: new Date(Date.now() + 120_000).toISOString(), retryAfterSeconds: 60 }, { status: 429 }));
    render(<ChatAiPanel rideId={rideId} latest={source} onUnavailable={denied} />, { locale });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: messages["chatAi.summary"] })));
    expect(screen.getByText(messages["ai.chatLow"])).toBeTruthy();
    const dialog = within(screen.getByRole("dialog"));
    const summary = dialog.getByRole("button", { name: messages["chatAi.summary"] });
    fireEvent.change(dialog.getByLabelText(messages["chatAi.question"]), { target: { value: "Where?" } });
    const submit = dialog.getByRole("button", { name: messages["chatAi.submit"] });
    expect(submit).toHaveProperty("disabled", false);
    await act(async () => fireEvent.click(submit));
    expect(screen.getByText(messages["ai.chatRetryAt"].replace("{time}", locale === "mk" ? "во: 22:01" : "22:01"))).toBeTruthy();
    expect(summary).toHaveProperty("disabled", true);
    expect(submit).toHaveProperty("disabled", true);
    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(summary).toHaveProperty("disabled", false);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => fireEvent.click(summary));
    expect(screen.getByText(messages["ai.chatRetryAt"].replace("{time}", locale === "mk" ? "во: 22:02" : "22:02"))).toBeTruthy();
    expect(submit).toHaveProperty("disabled", true);
  } finally {
    vi.useRealTimers();
  }
});
it("hides an old-language answer after switching while retaining the typed question", async () => {
  const panel = <ChatAiPanel rideId={rideId} latest={source} onUnavailable={denied} />;
  const view = render(<I18nProvider locale="en" messages={en}>{panel}</I18nProvider>);
  fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
  fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "My original question" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[1]);
  await screen.findByText("Pickup at the station");
  view.rerender(<I18nProvider locale="mk" messages={mk}>{panel}</I18nProvider>);
  expect(screen.queryByText("Pickup at the station")).toBeNull();
  expect(screen.getByText(mk["chatAi.languageChanged"])).toBeTruthy();
  expect(screen.getByLabelText(mk["chatAi.question"])).toHaveProperty("value", "My original question");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("only calls AI on request, shows full-history count and real source text", async () => {
  mount(); expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[0]);
  await screen.findByText("Pickup at the station");
  expect(screen.getByText(/Based on 151 messages/)).toBeDefined();
  fireEvent.click(screen.getByText("Source messages (1)"));
  expect(screen.getByText(source.body)).toBeDefined();
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ rideId, mode: "summary" });
});
it("focuses the labelled question field and keeps each question independent", async () => {
  fetcher.mockResolvedValue(Response.json({ ok: true, value: { ...answer, mode: "question", insufficientEvidence: true, items: [] } }));
  mount(); fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
  const input = screen.getByLabelText("Your question");
  expect(document.activeElement).toBe(input);
  fireEvent.change(input, { target: { value: "  What luggage?  " } });
  fireEvent.submit(input.closest("form")!);
  await screen.findByText("The chat does not say.");
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ rideId, mode: "question", question: "What luggage?" });
});
it("keeps a failed question, supports retry, and escapes model text", async () => {
  fetcher.mockRejectedValueOnce(new Error("offline"));
  fetcher.mockResolvedValueOnce(Response.json({ ok: true, value: { ...answer, mode: "question", items: [{ ...answer.items[0], text: "<script>bad()</script>" }] } }));
  const { container } = mount(); fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
  const input = screen.getByLabelText("Your question") as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "Where?" } }); fireEvent.submit(input.closest("form")!);
  await screen.findByRole("alert"); expect(input.value).toBe("Where?");
  fireEvent.click(screen.getByRole("button", { name: "Retry AI request" }));
  await screen.findByText("<script>bad()</script>"); expect(container.querySelector("script")).toBeNull();
});
it("marks new microsecond messages as stale without automatically generating again", async () => {
  const view = mount(); fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[0]);
  await screen.findByText("Pickup at the station");
  view.rerender(<ChatAiPanel rideId={rideId} latest={{ ...source, created_at: "2026-09-21T12:00:00.000002Z" }} onUnavailable={denied} />);
  expect(screen.getByText("New messages since this answer.")).toBeDefined(); expect(fetcher).toHaveBeenCalledTimes(1);
});
it("aborts and ignores late results when closed or unmounted", async () => {
  let finish!: (r: Response) => void;
  fetcher.mockImplementation(() => new Promise<Response>(resolve => { finish = resolve; }));
  const view = mount(); fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[0]);
  expect((screen.getAllByRole("button", { name: "Summarize chat" })[0] as HTMLButtonElement).disabled).toBe(true);
  const signal = fetcher.mock.calls[0][1].signal as AbortSignal;
  fireEvent.click(screen.getByRole("button", { name: "Close AI panel" })); expect(signal.aborted).toBe(true);
  await act(async () => finish(Response.json({ ok: true, value: answer })));
  fireEvent.click(screen.getByRole("button", { name: "Ask AI" })); expect(screen.queryByText("Pickup at the station")).toBeNull();
  fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[0]);
  const nextSignal = fetcher.mock.calls[1][1].signal as AbortSignal;
  view.unmount(); expect(nextSignal.aborted).toBe(true);
  await act(async () => finish(Response.json({ ok: true, value: answer })));
});
it("discards private output and notifies the room when access is revoked", async () => {
  fetcher.mockResolvedValue(Response.json({ ok: false, code: "unavailable", error: "Room unavailable" }));
  mount(); fireEvent.click(screen.getAllByRole("button", { name: "Summarize chat" })[0]);
  await waitFor(() => expect(denied).toHaveBeenCalledOnce());
  expect(screen.queryByText("Pickup at the station")).toBeNull();
});
it("opens a modal, closes on Escape, restores focus and unlocks scrolling", () => {
  mount();
  const trigger = screen.getByRole("button", { name: "Ask AI" });
  trigger.focus(); fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Private chat assistant" });
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).toBe("");
});

it("can summarize inside the modal after answering a question", async () => {
  fetcher.mockResolvedValueOnce(Response.json({ ok: true, value: { ...answer, mode: "question" } }));
  mount(); fireEvent.click(screen.getByRole("button", { name: "Ask AI" }));
  const field = screen.getByLabelText("Your question");
  fireEvent.change(field, { target: { value: "Where?" } }); fireEvent.submit(field.closest("form")!);
  await screen.findByRole("heading", { name: "AI answer" });
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Summarize chat" }));
  await screen.findByRole("heading", { name: "Chat summary" });
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ rideId, mode: "summary" });
});
it("aborts immediately and finishes closing even when animationend is unavailable", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  fetcher.mockImplementation(() => new Promise(() => {}));
  mount(); fireEvent.click(screen.getByRole("button", { name: "Summarize chat" }));
  fireEvent.click(screen.getByRole("button", { name: "Close AI panel" }));
  expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
  const dialog = screen.getByRole("dialog");
  expect(dialog.getAttribute("data-closing")).toBe("true");
  expect(document.body.style.overflow).toBe("hidden");
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
