import { allowedAuthAttempt, createSession, findOrCreateUser, FLOW_COOKIE, readCookie, revokeSession, SESSION_AGE, SESSION_COOKIE, sessionCookie } from "@/lib/account-auth";
import { accountErrorPath, consumeYandexIntent, exchangeYandexCode, yandexConfig } from "@/lib/yandex-auth";
import { requestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const url = new URL(new URL(request.url).pathname + new URL(request.url).search, requestOrigin(request));
  const headers = new Headers({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Set-Cookie": sessionCookie(request, FLOW_COOKIE, "", 0) });
  const redirect = (path: string) => { headers.set("Location", new URL(path, url.origin).toString()); return new Response(null, { status: 303, headers }); };
  let nextPath = "/account";
  try {
    const config = yandexConfig();
    if (!config || config.origin !== url.origin) return redirect("/account?error=not_configured");
    if (!allowedAuthAttempt(request, "callback")) return redirect("/account?error=rate_limit");
    if (url.searchParams.getAll("state").length !== 1 || url.searchParams.getAll("code").length > 1) return redirect("/account?error=expired");
    const intent = consumeYandexIntent(url.searchParams.get("state") || "", readCookie(request, FLOW_COOKIE));
    if (!intent) return redirect("/account?error=expired");
    nextPath = intent.nextPath;
    if (url.searchParams.has("error")) return redirect(accountErrorPath("cancelled", nextPath));
    const code = url.searchParams.get("code");
    if (!code || code.length > 1024) return redirect(accountErrorPath("expired", nextPath));
    const { yandexId, ...profile } = await exchangeYandexCode(code, intent.verifier);
    const user = findOrCreateUser(yandexId, profile);
    const token = createSession(user.id);
    revokeSession(readCookie(request, SESSION_COOKIE));
    headers.append("Set-Cookie", sessionCookie(request, SESSION_COOKIE, token, SESSION_AGE));
    return redirect(intent.nextPath);
  } catch { return redirect(accountErrorPath("unavailable", nextPath)); }
}
