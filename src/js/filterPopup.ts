import { updateSlidersUI } from "./populationSlider";
import Observable from "./Observable";
import { PlaceFilterManager } from "./FilterState";

function updateFilterPopupUI(isVisible: boolean): void {
  const popup = document.querySelector<HTMLElement>(".filters-popup-window");
  const icon = document.querySelector(".header-filter-icon-container");
  if (!popup || !icon) return;
  popup.style.display = isVisible ? "block" : "none";
  icon.ariaExpanded = isVisible.toString();
}

export default function initFilterPopup(filterManager: PlaceFilterManager) {
  const isVisible = new Observable<boolean>(false);
  isVisible.subscribe(updateFilterPopupUI);

  // We redraw the population slider on the first load because it requires the popup
  // to be displayed to compute offsetWidth.
  let hasInitedPopulation = false;
  isVisible.subscribe((visible) => {
    if (!hasInitedPopulation && visible) {
      updateSlidersUI(filterManager.getState());
      hasInitedPopulation = true;
    }
  });

  const popup = document.querySelector(".filters-popup-window");
  const icon = document.querySelector(".header-filter-icon-container");

  icon.addEventListener("click", () => {
    isVisible.setValue(!isVisible.getValue());
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
}
