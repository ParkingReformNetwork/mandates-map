/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */

import fs from "fs/promises";

import Handlebars from "handlebars";

import { escapePlaceId, readCompleteData, CompleteEntry } from "./lib/data";

function renderHandlebars(
  placeId: string,
  entry: CompleteEntry,
  template: HandlebarsTemplateDelegate,
): string {
  return template({
    placeId,
    summary: entry.summary,
    status: entry.status,
    policyChange: entry.policy.join("; "),
    landUse: entry.land.join("; "),
    scope: entry.scope.join("; "),
    requirements: entry.requirements.join("; "),
    reporter: entry.reporter,
    citations: entry.citations.map((citation, i) => ({
      idx: i + 1,
      ...citation,
    })),
  });
}

async function generatePage(
  placeId: string,
  entry: CompleteEntry,
  template: HandlebarsTemplateDelegate,
): Promise<void> {
  await fs.writeFile(
    `city_detail/${escapePlaceId(placeId)}.html`,
    renderHandlebars(placeId, entry, template),
  );
}

async function main(): Promise<void> {
  const [rawTemplate, completeData] = await Promise.all([
    fs.readFile("scripts/city_detail.html.handlebars", "utf-8"),
    readCompleteData(),
  ]);
  const template = Handlebars.compile(rawTemplate);
  await Promise.all(
    Object.entries(completeData).map(([placeId, entry]) =>
      generatePage(placeId, entry, template),
    ),
  );
}

if (process.env.NODE_ENV !== "test") {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
