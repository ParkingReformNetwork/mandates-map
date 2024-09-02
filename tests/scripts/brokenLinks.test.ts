import { expect, test } from "@playwright/test";
import { mapPlaceToCitationLinks } from "../../scripts/brokenLinks";

test("mapPlaceToCitationLinks correctly determines some example pages", async () => {
  // If the links get updated, then update the below tests.
  const result = await mapPlaceToCitationLinks();
  expect(result["Abilene, KS"]).toEqual([
    "http://abileneks.citycode.net/index.html#!artiOffStreParkLoadAndUnloRegu",
  ]);
  expect(result["Albion, NE"]).toEqual([
    "https://albionnebraska.wpengine.com/wp-content/uploads/2021/01/CHAPTER-9-ZONING-REGULATIONS.pdf",
  ]);
  expect(result["Petaluma, CA"]).toEqual([
    "https://petaluma.municipal.codes/SmartCode/6.10.030",
    "https://petaluma.municipal.codes/ZoningOrds/11.035",
  ]);
});
