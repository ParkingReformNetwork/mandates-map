/* global document, window */

import type Choices from "choices.js";
import type { CircleMarker, FeatureGroup } from "leaflet";
import type { CityId, CityEntry } from "./types";

const POPULATION_INTERVALS: Array<[string, number]> = [
  ["100", 100],
  ["500", 500],
  ["1k", 1000],
  ["5k", 5000],
  ["10k", 10000],
  ["50k", 50000],
  ["100k", 100000],
  ["500k", 500000],
  ["1M", 1000000],
  ["5M", 5000000],
  ["10M", 10000000],
  ["50M", 50000000],
];

/**
 * Return true if the city should be rendered on the map.
 *
 * Note that search takes priority. If certain cities are selected via
 * search, they should be shown regardless of the filters.
 */
const shouldBeRendered = (
  cityState: CityId,
  entry: CityEntry,
  searchElement: Choices
): boolean => {
  const searchChosen = new Set(searchElement.getValue(true) as string[]);
  if (searchChosen.size > 0) {
    return searchChosen.has(cityState);
  }

  // Else, search is not used and the filters should apply.
  const getSelected = (cls: string): Set<string> =>
    new Set(
      Array.from(document.querySelectorAll(cls)).map(
        (option: HTMLInputElement) => option.value
      )
    );

  const scopeSelected = getSelected(".filter--scope :checked");
  const isScope = entry["report_magnitude"]
    .split(",")
    .some((scope) => scopeSelected.has(scope));

  return isScope;
};

/**
 * Helper function to iterate over every city and either remove it or add it,
 * based on the search and filter values.
 *
 * This should be used with an event listener for each filter and search, whenever
 * their values change.
 */
const changeSelectedMarkers = (
  markerGroup: FeatureGroup,
  citiesToMarkers: Record<CityId, CircleMarker>,
  data: Record<CityId, CityEntry>,
  searchElement: Choices
) => {
  Object.entries(citiesToMarkers).forEach(([cityState, marker]) => {
    if (shouldBeRendered(cityState, data[cityState], searchElement)) {
      marker.addTo(markerGroup);
    } else {
      // @ts-ignore the API allows passing a LayerGroup, but the type hint doesn't show this.
      marker.removeFrom(markerGroup);
    }
  });
};

const setUpFilter = (
  markerGroup: FeatureGroup,
  citiesToMarkers: Record<CityId, CircleMarker>,
  data: Record<CityId, CityEntry>,
  searchElement: Choices
): void => {
  // We don't want each click to reset the selection. Instead, each click updates the selection by adding or removing a single selection.
  // As a result, the user won't have to use shift, ctrl/cmd to make complicated selections.
  document
    .querySelector(".filter--scope")
    .addEventListener("mousedown", (e: MouseEvent): void => {
      // For each option, do not exhibit normal behavior. Instead, change the option to the opposite state.
      const input = e.target as HTMLOptionElement;
      if (input.tagName === "OPTION") {
        e.preventDefault();
        input.parentElement.focus();
        input.selected = !input.selected;
      }
      changeSelectedMarkers(markerGroup, citiesToMarkers, data, searchElement);
      input.parentElement.blur(); // Removes the default blue selection over element.
    });
};

export {
  changeSelectedMarkers,
  POPULATION_INTERVALS,
  setUpFilter,
  shouldBeRendered,
};
