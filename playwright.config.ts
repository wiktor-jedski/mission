import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command:
      "MISSION_RUNTIME_REPOSITORY=local MISSION_TEST_TEAM_PINS=team-ember:1111,team-iron:2222 ADMIN_PASSWORD=admin-password APP_BASE_URL=http://localhost:3000 npm run dev -- --hostname localhost --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
