import { readCookie, revokeSession, SESSION_COOKIE, sessionCookie } from "@/lib/account-auth";
import { requestOrigin } from "@/lib/request-origin";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== requestOrigin(request)) return Response.json({ error: "Недопустимый запрос." }, { status: 403 });
  try {
    revokeSession(readCookie(request, SESSION_COOKIE));
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(request, SESSION_COOKIE, "", 0), "Cache-Control": "no-store" } });
  } catch { return Response.json({ error: "Не удалось выйти. Попробуйте ещё раз." }, { status: 503 }); }
}
