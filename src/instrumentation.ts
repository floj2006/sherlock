import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const digest = typeof error === "object" && error !== null && "digest" in error
    ? String(error.digest) : undefined;
  // Do not log request headers, credentials, query strings, or customer data.
  console.error(JSON.stringify({
    event: "server_request_error",
    digest,
    method: request.method,
    route: context.routePath,
    type: context.routeType,
  }));
};
