import { defineConfig } from "@playwright/test";
import path from "node:path";
import base from "./playwright.config";

// A dedicated process and database keep account fixtures away from real profiles.
process.env.SHERLOCK_ACCOUNT_TEST_DB ??= path.resolve("artifacts", `account-ui-${process.pid}-${Date.now()}.sqlite`);
process.env.ACCOUNT_DB_PATH = process.env.SHERLOCK_ACCOUNT_TEST_DB;
process.env.YANDEX_CLIENT_ID = "";
process.env.YANDEX_CLIENT_SECRET = "";
process.env.YANDEX_REDIRECT_URI = "";
export default defineConfig({
  ...base,
  testIgnore: [], testMatch: "account-ui.spec.ts",
  use: { ...base.use, baseURL: "http://127.0.0.1:3101" },
  webServer: { command: "npm run dev -- --hostname 127.0.0.1 --port 3101", url: "http://127.0.0.1:3101", reuseExistingServer: false, timeout: 120000,
    env: { SHERLOCK_ACCOUNT_TEST_DB: process.env.SHERLOCK_ACCOUNT_TEST_DB, ACCOUNT_DB_PATH: process.env.ACCOUNT_DB_PATH, YANDEX_CLIENT_ID: "", YANDEX_CLIENT_SECRET: "", YANDEX_REDIRECT_URI: "" } },
});
