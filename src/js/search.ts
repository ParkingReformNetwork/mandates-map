import Choices from "choices.js";
import "choices.js/public/assets/styles/choices.css";

import Observable from "./Observable";
import { PlaceFilterManager } from "./FilterState";

function updateSearchPopupUI(isVisible: boolean) {
  const popup = document.querySelector<HTMLElement>("#search-popup");
  const icon = document.querySelector(".header-search-icon-container");
  if (!popup || !icon) return;
  popup.hidden = !isVisible;
  icon.ariaExpanded = isVisible.toString();
}

type SearchPopupObservable = Observable<boolean>;

function initSearchPopup(): SearchPopupObservable {
  const isVisible = new Observable<boolean>(false);
  isVisible.subscribe(updateSearchPopupUI);

  const popup = document.querySelector("#search-popup");
  const selectElement = document.querySelector<HTMLInputElement>("div.choices");
  const icon = document.querySelector(".header-search-icon-container");
  if (!icon) throw new Error("icon not found");

  icon.addEventListener("click", () => {
    isVisible.setValue(!isVisible.getValue());
    setTimeout(() => selectElement?.click(), 100);
  });

  // Clicks outside the popup close it.
  window.addEventListener("click", (event) => {
    if (
      isVisible.getValue() === true &&
      event.target instanceof Element &&
      !icon?.contains(event.target) &&
      !popup?.contains(event.target)
    ) {
      isVisible.setValue(false);
    }
  });

  isVisible.initialize();
  return isVisible;
}

export default function initSearch(filterManager: PlaceFilterManager): void {
  const places = Object.entries(filterManager.entries).map(
    ([placeId, entry]) => ({
      value: placeId,
      label: placeId,
      customProperties: {
        place: entry.place,
        state: entry.state || "",
      },
    }),
  );
  const htmlElement = document.querySelector(".search");
  if (!htmlElement) return;

  const choices = new Choices(htmlElement, {
    position: "bottom",
    choices: places,
    placeholderValue: "Search",
    removeItemButton: true,
    allowHTML: false,
    itemSelectText: "",
    searchEnabled: true,
    searchResultLimit: 8,
    searchFields: ["customProperties.place", "customProperties.state"],
  });

  // Set initial state.
  choices.setChoiceByValue(filterManager.getState().searchInput || "");

  // Also set up the popup.
  const popupIsVisible = initSearchPopup();

  // Ensure that programmatic changes that set FilterState.searchInput to null
  // update the UI element too.
  filterManager.subscribe((state) => {
    if (state.searchInput === null) choices.setChoiceByValue("");
  });

  // User-driven inputs to search should update the FilterState.
  htmlElement.addEventListener("change", () => {
    filterManager.update({
      searchInput: (choices.getValue(true) as string) || null,
    });
    popupIsVisible.setValue(false);
  });
}
