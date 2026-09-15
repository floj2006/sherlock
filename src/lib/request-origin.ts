// Next may expose its internal localhost URL. Host is the browser's target host;
// do not use an untrusted X-Forwarded-Host to decide whether a mutation is same-origin.
export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  if (host) {
    if (!/^[a-z0-9.[\]:-]+$/i.test(host)) throw new Error("Invalid host");
    url.host = host;
  }
  const configured = process.env.YANDEX_REDIRECT_URI;
  if (configured) {
    const external = new URL(configured);
    if (external.host === url.host && external.protocol === "https:") url.protocol = "https:";
  }
  return url.origin;
}
