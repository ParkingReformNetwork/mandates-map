import { PopulationSliders } from "./types";
import type { CircleMarker, FeatureGroup } from "leaflet";
import type { CityId, CityEntry } from "./types";

// TODO: replace with changeSelectedMarkers from ./filter.ts.
const changeSelectedMarkers = (
  markerGroup: FeatureGroup,
  citiesToMarkers: Record<CityId, CircleMarker>,
  filterFn: (cityState: CityId) => boolean
) => {
  Object.entries(citiesToMarkers).forEach(([cityState, marker]) => {
    if (filterFn(cityState)) {
      marker.addTo(markerGroup);
    } else {
      // @ts-ignore the API allows passing a LayerGroup, but the type hint doesn't show this.
      marker.removeFrom(markerGroup);
    }
  });
};

const THUMBSIZE = 14;
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
const RANGE_MAX = POPULATION_INTERVALS.length - 1;

const draw = (
  sliders: PopulationSliders,
  leftIndex: number,
  rightIndex: number
): void => {
  // We dynamically change the sliders so that they cannot extend past each other.
  const cross = rightIndex - 0.5 >= leftIndex ? rightIndex - 0.5 : rightIndex; // a single interval that min and max sliders overlap
  const extend = leftIndex + 1 == rightIndex; // if sliders are close and within 1 step can overlap
  const newLeftMax = extend ? cross + 0.5 : cross;
  const newRightMin = cross;

  sliders.left.setAttribute("max", newLeftMax.toString());
  sliders.right.setAttribute("min", newRightMin.toString());

  const intervalSizePx =
    sliders.controls.offsetWidth / POPULATION_INTERVALS.length;
  const leftWidth = newLeftMax * intervalSizePx;
  const rightWidth = (RANGE_MAX - newRightMin) * intervalSizePx;
  sliders.left.style.width = `${leftWidth + THUMBSIZE}px`;
  sliders.right.style.width = `${rightWidth + THUMBSIZE}px`;

  // The left slider has a fixed anchor. However, the right slider has to move
  // everytime the range of the slider changes.
  const offset = 5;
  sliders.left.style.left = `${offset}px`;
  sliders.right.style.left = extend
    ? `${leftWidth - intervalSizePx / 2 + offset}px`
    : `${leftWidth + offset}px`;

  const updateLabel = (cls: string, index: number): void => {
    document.querySelector(cls).innerHTML = POPULATION_INTERVALS[index][0];
  };
  updateLabel(".population-slider-label-min", leftIndex);
  updateLabel(".population-slider-label-max", rightIndex);
};

const setUpPopulationSlider = (
  markerGroup: FeatureGroup,
  citiesToMarkers: Record<CityId, CircleMarker>,
  data: Record<CityId, CityEntry>
): void => {
  const sliders = new PopulationSliders(
    document.querySelector(".population-slider-controls"),
    document.querySelector(".population-slider-left"),
    document.querySelector(".population-slider-right")
  );

  sliders.left.setAttribute("max", RANGE_MAX.toString());
  sliders.right.setAttribute("max", RANGE_MAX.toString());
  sliders.right.value = RANGE_MAX.toString();
  draw(sliders, 0, RANGE_MAX);

  const legend = document.querySelector(".population-slider-legend");
  POPULATION_INTERVALS.forEach(([intervalText]) => {
    const span = document.createElement("span");
    span.appendChild(document.createTextNode(intervalText));
    legend.appendChild(span);
  });

  const onChange = (): void => {
    const [leftIndex, rightIndex] = sliders.getCurrentIndexes();
    sliders.left.value = leftIndex.toString();
    sliders.right.value = rightIndex.toString();
    draw(sliders, leftIndex, rightIndex);
    changeSelectedMarkers(markerGroup, citiesToMarkers, (cityState) => {
      const population = parseInt(data[cityState]["population"]);
      return (
        population >= POPULATION_INTERVALS[leftIndex][1] &&
        population <= POPULATION_INTERVALS[rightIndex][1]
      );
    });
  };

  sliders.left.addEventListener("input", onChange);
  sliders.right.addEventListener("input", onChange);
};

export default setUpPopulationSlider;
