import { beforeEach, expect, it, vi } from "vitest";

const { send, generateLink, verifyOtp } = vi.hoisted(() => ({ send: vi.fn(), generateLink: vi.fn(), verifyOtp: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ origin: "http://localhost:3100" }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { signInWithOtp: send, verifyOtp } }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ auth: { admin: { generateLink } } }) }));
vi.mock("@/lib/auth/session", () => ({ safeNextPath: () => "/rides", getProfileCompletion: vi.fn() }));
vi.mock("@/lib/auth/email-domain", () => ({ isAllowedStudentEmail: (email: string) => email.endsWith("@students.example.com") }));
import { requestMagicLink } from "./actions";

beforeEach(() => vi.clearAllMocks());
function form(email: string, intent = "magic-link") {
  const data = new FormData(); data.set("email", email); data.set("intent", intent); return data;
}

it.each(["invalid", "other@example.com"])("rejects %s before contacting auth services", async email => {
  expect(await requestMagicLink({ status: "idle" }, form(email))).toMatchObject({ status: "error", messageKey: "auth.approvedEmail" });
  expect(send).not.toHaveBeenCalled(); expect(generateLink).not.toHaveBeenCalled();
});

it("returns a stable success code with the interpolation value", async () => {
  send.mockResolvedValue({ error: null });
  expect(await requestMagicLink({ status: "idle" }, form("student@students.example.com"))).toEqual({ status: "sent", messageKey: "auth.sent", email: "student@students.example.com" });
});

it("maps provider errors to a localizable code without exposing their text", async () => {
  send.mockResolvedValue({ error: { status: 429, message: "private provider diagnostic" } });
  expect(await requestMagicLink({ status: "idle" }, form("student@students.example.com"))).toEqual({ status: "error", messageKey: "auth.rateLimited", email: "student@students.example.com" });
});

it("does not display exception text during instant sign-in", async () => {
  generateLink.mockRejectedValue(new Error("private configuration detail"));
  expect(await requestMagicLink({ status: "idle" }, form("student@students.example.com", "sign-in"))).toEqual({ status: "error", messageKey: "auth.failed", email: "student@students.example.com" });
});
