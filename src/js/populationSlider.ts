import { FilterPopupVisibleObservable } from "./filterPopup";
import {
  FilterState,
  PlaceFilterManager,
  POPULATION_INTERVALS,
} from "./FilterState";

const THUMBSIZE = 14;
export const POPULATION_MAX_INDEX = POPULATION_INTERVALS.length - 1;

interface Sliders {
  readonly controls: HTMLDivElement;
  readonly left: HTMLInputElement;
  readonly right: HTMLInputElement;
}

function getSliders(): Sliders {
  return {
    controls: document.querySelector(".population-slider-controls"),
    left: document.querySelector(".population-slider-left"),
    right: document.querySelector(".population-slider-right"),
  };
}

function updateSlidersUI(state: FilterState): void {
  const [leftIndex, rightIndex] = state.populationSliderIndexes;
  const sliders = getSliders();

  sliders.left.value = leftIndex.toString();
  sliders.right.value = rightIndex.toString();
  sliders.left.setAttribute("value", leftIndex.toString());
  sliders.right.setAttribute("value", rightIndex.toString());

  // We dynamically change the sliders so that they cannot extend past each other.
  const inBetween = (rightIndex - leftIndex) / 2;
  const newLeftMax = leftIndex + inBetween;
  const newRightMin = rightIndex - inBetween;
  sliders.left.setAttribute("max", newLeftMax.toString());
  sliders.right.setAttribute("min", newRightMin.toString());

  const intervalSizePx = Math.round(
    (sliders.controls.offsetWidth + THUMBSIZE / 2) /
      POPULATION_INTERVALS.length,
  );
  const leftWidth = newLeftMax * intervalSizePx;
  const rightWidth = (POPULATION_MAX_INDEX - newRightMin) * intervalSizePx;
  sliders.left.style.width = `${leftWidth + THUMBSIZE / 2}px`;
  sliders.right.style.width = `${rightWidth + THUMBSIZE / 2}px`;

  // The left slider has a fixed anchor. However, the right slider has to move
  // everytime the range of the slider changes.
  sliders.right.style.left = `${leftWidth + THUMBSIZE}px`;

  const leftLabel = POPULATION_INTERVALS[leftIndex][0];
  const rightLabel = POPULATION_INTERVALS[rightIndex][0];
  document.querySelector("#population-slider-label").innerHTML =
    `${leftLabel} - ${rightLabel} residents`;
}

export function initPopulationSlider(
  filterManager: PlaceFilterManager,
  filterPopupIsVisible: FilterPopupVisibleObservable,
): void {
  const sliders = getSliders();

  // Create legend
  const legend = document.querySelector(".population-slider-legend");
  POPULATION_INTERVALS.forEach(([intervalText]) => {
    const span = document.createElement("span");
    span.appendChild(document.createTextNode(intervalText));
    legend.appendChild(span);
  });

  // Set initial state.
  const maxIndex = filterManager
    .getState()
    .populationSliderIndexes[1].toString();
  sliders.left.setAttribute("max", maxIndex);
  sliders.right.setAttribute("max", maxIndex);
  sliders.right.setAttribute("value", maxIndex);

  // Add event listeners.
  const onChange = (): void => {
    const leftIndex = Math.floor(parseFloat(sliders.left.value));
    const rightIndex = Math.ceil(parseFloat(sliders.right.value));
    filterManager.update({ populationSliderIndexes: [leftIndex, rightIndex] });
  };
  sliders.left.addEventListener("input", onChange);
  sliders.right.addEventListener("input", onChange);

  // Update UI whenever filter popup is visible. Note that
  // the popup must be visible for the width calculations to work.
  filterPopupIsVisible.subscribe((isVisible) => {
    if (isVisible) {
      updateSlidersUI(filterManager.getState());
    }
  });
}
