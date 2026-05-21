import { expect, test } from "@playwright/test";

test("player can submit proof, admin can approve it, and map progress refreshes", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mission Treasure Hunt" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Zaloguj druzyne" }).click();
  await page.getByLabel("PIN druzyny").fill("1111");
  await page.getByRole("button", { name: "Wejdz" }).click();
  await expect(page.getByText("Jestes zalogowany jako Druzyna Zarzewia.")).toBeVisible();

  await page.goto("/quests/amber-vault-k9q4m2x7");
  await expect(page.getByRole("heading", { name: "Pieczec Bursztynu" })).toBeVisible();
  await page.getByLabel("Kto dodaje dowod").fill("Ala");
  await page.getByLabel("Link do zdjecia").fill("https://example.com/photo");
  await page.getByRole("button", { name: "Wyslij dowod" }).click();
  await expect(page.getByRole("status")).toContainText("Dowod czeka");
  await expect(page.getByRole("button", { name: "Wyslij dowod" })).toHaveCount(0);

  await page.goto("/submissions");
  await expect(page.getByText("Pieczec Bursztynu")).toBeVisible();
  await expect(page.getByText("https://example.com/photo")).toHaveCount(0);

  await page.goto("/admin");
  await page.getByLabel("Haslo admina").fill("admin-password");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByRole("heading", { name: "Zgloszenia do sprawdzenia" })).toBeVisible();
  await expect(page.getByText("https://example.com/photo")).toHaveCount(0);
  await page.getByRole("button", { name: "Zatwierdz" }).click();
  await expect(page.getByText("Brak zgloszen oczekujacych.")).toBeVisible();

  await page.goto("/map");
  await expect(page.getByRole("status")).toContainText("1/21");
  await expect(page.getByText("Finalny skarb jest jeszcze zablokowany.")).toBeVisible();

  await page.goto("/logout");
  await page.getByLabel("PIN druzyny").fill("2222");
  await page.getByRole("button", { name: "Wejdz" }).click();
  await page.goto("/submissions");
  await expect(page.getByText("Pieczec Bursztynu")).toHaveCount(0);
});

test("invalid PIN and unknown quest stay safe; rejected quest can resubmit", async ({
  page,
  request
}) => {
  await page.goto("/login");
  await page.getByLabel("PIN druzyny").fill("9999");
  await page.getByRole("button", { name: "Wejdz" }).click();
  await expect(page.getByRole("alert")).toContainText("Nieprawidlowy PIN");
  await expect(page.getByText("Druzyna Zarzewia")).toHaveCount(0);

  await page.getByLabel("PIN druzyny").fill("1111");
  await page.getByRole("button", { name: "Wejdz" }).click();
  await page.goto("/quests/not-a-real-quest");
  await expect(page.getByRole("heading", { name: "Misja niedostepna" })).toBeVisible();
  await expect(page.getByText(/dowod|postep|Druzyna/i)).toHaveCount(0);

  await request.post("/test-support/rejected", {
    data: {
      teamId: "team-ember",
      questSlug: "broken-compass-r8w1s6d4"
    }
  });
  await page.goto("/quests/broken-compass-r8w1s6d4");
  await expect(page.getByRole("alert")).toContainText("Poprawcie dowod");
  await page.getByLabel("Kto dodaje dowod").fill("Ola");
  await page.getByLabel("Link do zdjecia").fill("https://example.com/new-photo");
  await page.getByRole("button", { name: "Wyslij dowod" }).click();
  await expect(page.getByRole("status")).toContainText("Dowod czeka");
});

test("phase 5 hint, audit, override, replacement proof, and polling smoke", async ({
  page
}) => {
  await page.goto("/login");
  await page.getByLabel("PIN druzyny").fill("2222");
  await page.getByRole("button", { name: "Wejdz" }).click();
  await page.goto("/quests/silent-forge-p6t8n3v1");
  await page.getByRole("button", { name: "Pokaz podpowiedz" }).click();
  await expect(page.getByText("Podpowiedz do misji 2.")).toBeVisible();

  await page.goto("/admin");
  await page.getByLabel("Haslo admina").fill("admin-password");
  await page.getByRole("button", { name: "Zaloguj" }).click();
  await expect(page.getByRole("heading", { name: "Zgloszenia do sprawdzenia" })).toBeVisible();
  await page.getByRole("button", { name: "Odkryj fragment" }).click();
  await expect(page.getByRole("heading", { name: "Zgloszenia do sprawdzenia" })).toBeVisible();
  await page.getByLabel("Autor dowodu").fill("Admin");
  await page.getByLabel("Dowod", { exact: true }).fill("https://example.com/replacement");
  await page.getByRole("button", { name: "Dodaj dowod zastepczy" }).click();
  await expect(page.getByRole("heading", { name: "Zgloszenia do sprawdzenia" })).toBeVisible();

  await page.goto("/admin/audit");
  await expect(page.getByRole("heading", { name: "Dziennik audytu" })).toBeVisible();
  await expect(page.getByText("Uzycie podpowiedzi")).toBeVisible();
  await expect(page.getByText("Reczne odkrycie fragmentu")).toBeVisible();
  await expect(page.getByText("Dowod zastepczy")).toBeVisible();

  await page.goto("/quests/silent-forge-p6t8n3v1");
  await page.getByLabel("Kto dodaje dowod").fill("Ewa");
  await page.getByLabel("Link do filmu").fill("https://example.com/video");
  await page.getByRole("button", { name: "Wyslij dowod" }).click();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Cicha Kuznia" })).toBeVisible();
});
