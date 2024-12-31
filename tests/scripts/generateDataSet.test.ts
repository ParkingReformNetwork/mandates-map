import { expect, test } from "@playwright/test";

import {
  createAnyPolicyCsvs,
  createReformCsv,
} from "../../scripts/generateDataSet";
import type {
  Citation,
  ProcessedCompleteEntry,
  ProcessedCompleteLegacyReform,
} from "../../scripts/lib/data";
import { Date } from "../../src/js/types";

// This test uses snapshot testing (https://jestjs.io/docs/snapshot-testing#updating-snapshots). If the tests fail and the changes
// are valid, run `npm test -- --updateSnapshot`.

function normalize(csv: string): string {
  return csv.replace(/\r\n/g, "\n");
}

// eslint-disable-next-line no-empty-pattern
test("generate CSVs", async ({}, testInfo) => {
  // Normally, Playwright saves the operating system name in the snapshot results.
  // Our test is OS-independent, so turn this off.
  // eslint-disable-next-line no-param-reassign
  testInfo.snapshotSuffix = "";

  // This gets ignored and is only for the type checker.
  const unifiedPolicy: ProcessedCompleteLegacyReform = {
    summary: "",
    status: "passed",
    policy: [],
    scope: [],
    land: [],
    date: null,
    reporter: "",
    requirements: [],
    citations: [],
  };

  const citation: Citation = {
    description: "citation",
    url: null,
    notes: null,
    attachments: [],
    screenshots: [],
  };

  const entries: ProcessedCompleteEntry[] = [
    {
      place: {
        name: "My City",
        state: "NY",
        country: "US",
        type: "city",
        repeal: true,
        pop: 24104,
        coord: [44.23, 14.23],
        url: "https://parkingreform.org/my-city-details.html",
      },
      unifiedPolicy,
      add_max: [
        {
          summary: "Maximums summary #1",
          status: "passed",
          scope: ["citywide"],
          land: ["commercial", "other"],
          requirements: ["by right"],
          date: new Date("2022-02-13"),
          reporter: "Donald Shoup",
          citations: [citation, citation],
        },
        {
          summary: "Maximums summary #2",
          status: "repealed",
          scope: ["regional"],
          land: ["other"],
          requirements: [],
          date: null,
          reporter: "Donald Shoup",
          citations: [citation],
        },
      ],
    },
    {
      place: {
        name: "Another Place",
        state: "CA",
        country: "US",
        type: "county",
        repeal: false,
        pop: 414,
        coord: [80.3, 24.23],
        url: "https://parkingreform.org/another-place.html",
      },
      unifiedPolicy,
      rm_min: [
        {
          summary: "Remove minimums",
          status: "proposed",
          scope: [],
          land: [],
          requirements: [],
          date: null,
          reporter: "Donald Shoup",
          citations: [],
        },
      ],
    },
  ];
  const { passed, proposed, repealed } = createAnyPolicyCsvs(entries);
  expect(normalize(passed)).toMatchSnapshot("overview-passed.csv");
  expect(normalize(proposed)).toMatchSnapshot("overview-proposed.csv");
  expect(normalize(repealed)).toMatchSnapshot("overview-repealed.csv");

  const maximums = createReformCsv(entries, (entry) => entry.add_max);
  expect(normalize(maximums)).toMatchSnapshot("maximums.csv");
});
