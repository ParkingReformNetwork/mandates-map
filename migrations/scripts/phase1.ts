/* eslint-disable no-console */

import { createItems, readItems, deleteItems } from "@directus/sdk";
import { zip } from "lodash-es";
import { DateTime } from "luxon";

import {
  initDirectus,
  DirectusClient,
  Place as DirectusPlace,
  Citation as DirectusCitation,
  Schema,
  PlaceType,
  LegacyReform,
  LegacyReformCitationJunction,
} from "../../scripts/lib/directus";
import { CompleteEntry, readCompleteData } from "../../scripts/lib/data";
import { PlaceId as PlaceStringId } from "../../src/js/types";

const NUM_PLACES_LIMIT = 1;

async function main(): Promise<void> {
  let jsonData = await readCompleteData();
  if (NUM_PLACES_LIMIT > 0) {
    jsonData = Object.fromEntries(
      Object.entries(jsonData).slice(0, NUM_PLACES_LIMIT),
    );
  }

  const client = await initDirectus();

  await purgeDatabase(client);

  // Then, migrate the data.
  // TODO: upload files
  const placesToDirectusIds = await populatePlaces(client, jsonData);
  const citationsDirectusIds = await populateCitations(client, jsonData);
  const reformDirectusIds = await populateLegacyReforms(
    client,
    jsonData,
    placesToDirectusIds,
  );
  await associateReformsToCitations(
    client,
    reformDirectusIds,
    citationsDirectusIds,
  );

  process.exit(0);
}

/** Delete all records so that this script is idempotent. */
async function purgeDatabase(client: DirectusClient): Promise<void> {
  const purge = async (table: keyof Schema) => {
    const ids = await client.request(readItems(table, { fields: ["id"] }));
    if (!ids.length) return;
    await client.request(
      deleteItems(
        table,
        ids.map((entry) => entry.id),
      ),
    );
  };

  // The order matters due to relations between the tables.
  // TODO: delete files
  await purge("citations_files");
  await purge("legacy_reforms_citations");
  await purge("legacy_reforms");
  await purge("citations");
  await purge("places");
}

async function populatePlaces(
  client: DirectusClient,
  jsonData: Record<PlaceStringId, CompleteEntry>,
): Promise<Record<PlaceStringId, number>> {
  const toCreate: Array<Partial<DirectusPlace>> = Object.values(jsonData).map(
    (entry) => ({
      name: entry.place,
      state: entry.state,
      country_code: entry.country,
      type: determinePlaceType(entry.place, entry.state),
      population: entry.pop,
      coordinates: {
        type: "Point",
        coordinates: entry.coord,
      },
    }),
  );
  const result = await client.request(
    createItems("places", toCreate, { fields: ["id"] }),
  );
  return Object.fromEntries(
    zip(
      Object.keys(jsonData),
      result.map((entry) => entry.id),
    ),
  );
}

async function populateCitations(
  client: DirectusClient,
  jsonData: Record<PlaceStringId, CompleteEntry>,
): Promise<Record<PlaceStringId, number[]>> {
  const toCreate: Array<Partial<DirectusCitation>> = Object.values(
    jsonData,
  ).flatMap((entry) =>
    entry.citations.map((citation) => ({
      type: citation.type,
      source_description: citation.description,
      notes: citation.notes,
      url: citation.url,
      attachments: [],
    })),
  );
  const apiResult = await client.request(
    createItems("citations", toCreate, { fields: ["id"] }),
  );

  // We now need to group every citation belonging to a single place. We do this
  // by creating two parallel arrays, `directusIds` and `placeStringIds`, where each
  // index corresponds to the other. We can then `zip()` to build the final result.
  const directusIds = apiResult.map((citation) => citation.id);
  const placeStringIds = Object.entries(jsonData).flatMap(([placeId, entry]) =>
    entry.citations.map(() => placeId),
  );
  const result: Record<PlaceStringId, number[]> = {};
  for (const [placeId, citationId] of zip(placeStringIds, directusIds)) {
    if (!placeId || !citationId) throw new Error("zip() failed");
    result[placeId] = [...(result[placeId] || []), citationId];
  }
  return result;
}

async function populateLegacyReforms(
  client: DirectusClient,
  jsonData: Record<PlaceStringId, CompleteEntry>,
  placeDirectusIds: Record<PlaceStringId, number>,
): Promise<Record<PlaceStringId, number>> {
  const toCreate: Array<Partial<LegacyReform>> = Object.entries(jsonData).map(
    ([placeStringId, entry]) => {
      return {
        place: placeDirectusIds[placeStringId],
        last_verified_at: DateTime.now().toFormat("yyyy-MM-dd") as "datetime",
        policy_changes: entry.policy,
        land_uses: entry.land,
        reform_scope: entry.scope,
        requirements: entry.requirements,
        status: entry.status,
        summary: entry.summary,
        reporter: entry.reporter,
        reform_date: normalizeReformDate(entry.date),
        complete_minimums_repeal: entry.repeal,
        citations: [],
      };
    },
  );
  const result = await client.request(
    createItems("legacy_reforms", toCreate, { fields: ["id"] }),
  );
  return Object.fromEntries(
    zip(
      Object.keys(jsonData),
      result.map((entry) => entry.id),
    ),
  );
}

async function associateReformsToCitations(
  client: DirectusClient,
  reformDirectusIds: Record<PlaceStringId, number>,
  citationDirectusIds: Record<PlaceStringId, number[]>,
): Promise<void> {
  const toCreate: Array<Partial<LegacyReformCitationJunction>> = Object.entries(
    reformDirectusIds,
  ).flatMap(([placeId, reformId]) =>
    citationDirectusIds[placeId].map((citationId) => ({
      citations_id: citationId,
      legacy_reforms_id: reformId,
    })),
  );
  await client.request(
    createItems("legacy_reforms_citations", toCreate, { fields: [] }),
  );
}

function determinePlaceType(name: string, state: string | null): PlaceType {
  if (!state) return "country";
  const states = new Set([
    "California|CA",
    "Florida|FL",
    "Washington|WA",
    "Colorado|CO",
    "Oregon|OR",
    "Connecticut|CT",
    "Maine|ME",
    "Minnesota|MN",
    "Montana|MT",
  ]);
  if (states.has(`${name}|${state}`)) return "state";
  if (name.endsWith("County") || name.endsWith("Parish")) return "county";
  return "city";
}

function normalizeReformDate(v: string | null): string | null {
  return v
    ? DateTime.fromFormat(v, "LLL d, yyyy").toFormat("yyyy-MM-dd")
    : null;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
