import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false, // the tests share one database
  workers: 1,
  reporter: [["list"]],
  // next dev compiles each route on first visit, so the first test to reach
  // a page pays for it.
  timeout: 90_000,

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "phone",
      // The seller runs the admin from a phone, so that is the size the
      // tests use. channel picks the full Chromium that `playwright install
      // chromium` downloads, instead of the separate headless shell build.
      use: { ...devices["Pixel 7"], channel: "chromium" },
    },
  ],

  webServer: {
    // A production build, not `next dev`. Under dev the HMR socket kept
    // failing here, the client never finished hydrating, and the login form
    // fell back to a native submit that never called the API. Tests were
    // reporting a broken dev server rather than anything about the app.
    // This also keeps the port clear of the dev server you run on 3000.
    command: `npx next build && npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
