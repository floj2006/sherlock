import { allowedAuthAttempt, FLOW_COOKIE, sessionCookie } from "@/lib/account-auth";
import { accountErrorPath, beginYandexLogin, yandexConfig } from "@/lib/yandex-auth";
import { requestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const current = new URL(new URL(request.url).pathname + new URL(request.url).search, requestOrigin(request));
  const fail = (error: string) => new Response(null, { status: 303, headers: { Location: new URL(accountErrorPath(error, current.searchParams.get("next")), current.origin).toString(), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  try {
    const config = yandexConfig();
    if (!config) return fail("not_configured");
    if (current.origin !== config.origin) return fail("wrong_domain");
    if (!allowedAuthAttempt(request, "login")) return fail("rate_limit");
    const login = beginYandexLogin(current.searchParams.get("next"));
    return new Response(null, { status: 303, headers: { Location: login.url, "Set-Cookie": sessionCookie(request, FLOW_COOKIE, login.binding, 600), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch { return fail("unavailable"); }
}
