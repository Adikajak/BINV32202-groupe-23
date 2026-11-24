import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Connexion de démonstration" })).toBeVisible();
  await page.getByRole("button", { name: "Lucas Dupont", exact: true }).click();
  await page.getByRole("link", { name: "Offres", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Mot-clé" })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Période" })).toHaveValue("");
});

test("Scénario 1 — recherche une offre par un mot de son titre", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Mot-clé" }).fill(" api ");

  const resultRows = page.getByRole("table").getByRole("row");
  await expect(resultRows).toHaveCount(2);
  const offerRow = resultRows.filter({
    has: page.getByRole("cell", { name: "API REST de facturation", exact: true }),
  });
  await expect(offerRow).toHaveCount(1);
  await expect(offerRow.getByRole("cell", { name: "2026-2027", exact: true })).toBeVisible();
  await expect(offerRow.getByRole("cell", { name: "Publiée", exact: true })).toBeVisible();
  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();
});

test("Scénario 2 — ne recherche pas dans la description de l'offre", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Mot-clé" }).fill("intégrée");

  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(
    page.getByText("Aucune offre ne correspond à votre recherche.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("API REST de facturation", { exact: true })).toHaveCount(0);
});
