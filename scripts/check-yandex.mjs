import assert from "node:assert/strict";

// Checks the running site without signing in or printing credentials/cookies.
try {
  const clientId = process.env.YANDEX_CLIENT_ID?.trim();
  const secret = process.env.YANDEX_CLIENT_SECRET?.trim();
  assert(clientId && secret, "Set YANDEX_CLIENT_ID and YANDEX_CLIENT_SECRET on the server.");
  const callback = new URL(process.env.YANDEX_REDIRECT_URI);
  assert.equal(callback.pathname, "/api/auth/yandex/callback", "Unexpected callback path.");
  assert(!callback.search && !callback.hash && !callback.username && !callback.password, "Use a callback URL without credentials, query or fragment.");
  assert(callback.protocol === "https:" || (callback.protocol === "http:" && ["localhost", "127.0.0.1"].includes(callback.hostname)), "HTTPS is required outside localhost.");

  const next = "/book?service=mens-cut";
  const response = await fetch(new URL("/api/auth/yandex?" + new URLSearchParams({ next }), callback), {
    redirect: "manual", signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 303, "The login endpoint must redirect with HTTP 303.");
  const location = new URL(response.headers.get("location"));
  if (location.origin !== "https://oauth.yandex.ru") {
    throw new Error("Login did not reach Yandex: " + (location.searchParams.get("error") || "unexpected redirect"));
  }
  assert.equal(location.pathname, "/authorize");
  assert.equal(location.searchParams.get("client_id"), clientId);
  assert.equal(location.searchParams.get("redirect_uri"), callback.href);
  assert.equal(location.searchParams.get("response_type"), "code");
  assert.equal(location.searchParams.get("code_challenge_method"), "S256");
  assert.match(location.searchParams.get("code_challenge") || "", /^[A-Za-z0-9_-]{43}$/);
  assert.match(location.searchParams.get("state") || "", /^[A-Za-z0-9_-]{43}$/);
  assert(!location.searchParams.has("client_secret"), "Client secret must stay on the server.");
  const cookie = response.headers.getSetCookie().find(value => value.startsWith("sherlock_oauth=")) || "";
  assert(cookie.includes("HttpOnly") && cookie.includes("SameSite=Lax") && cookie.includes("Max-Age=600"), "Missing protected OAuth cookie.");
  if (callback.protocol === "https:") assert(cookie.includes("Secure"), "HTTPS cookies must be Secure.");
  assert.equal(response.headers.get("cache-control"), "no-store");
  console.log("Yandex login is configured: redirect, PKCE, state and browser cookie passed.");
  console.log("Callback: " + callback.href);
  console.log("Complete one sign-in in the browser to verify Yandex consent and token exchange.");
} catch (error) {
  // Assertion internals may contain response data; only print the message.
  console.error("Yandex check failed: " + (error instanceof Error ? error.message.split("\n")[0] : "unknown error"));
  process.exitCode = 1;
}
