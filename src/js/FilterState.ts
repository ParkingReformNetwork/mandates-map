import { isEqual } from "lodash-es";
import { PlaceId, PlaceEntry } from "./types";
import Observable from "./Observable";

export const POPULATION_INTERVALS: Array<[string, number]> = [
  ["100", 100],
  ["5k", 5000],
  ["25k", 25000],
  ["50k", 50000],
  ["100k", 100000],
  ["500k", 500000],
  ["1M", 1000000],
  ["50M", 50000000],
];

export interface FilterState {
  searchInput: string | null;
  allMinimumsRepealedToggle: boolean;
  policyChange: string[];
  scope: string[];
  landUse: string[];
  status: string[];
  populationSliderIndexes: [number, number];
}

interface CacheEntry {
  placeIds: Set<string>;
  state: FilterState;
}

export class PlaceFilterManager {
  private readonly state: Observable<FilterState>;

  readonly entries: Record<PlaceId, PlaceEntry>;

  private cache: CacheEntry | null = null;

  constructor(entries: Record<PlaceId, PlaceEntry>, initialState: FilterState) {
    this.entries = entries;
    this.state = new Observable(initialState);
  }

  get totalNumPlaces(): number {
    return Object.keys(this.entries).length;
  }

  get placeIds(): Set<PlaceId> {
    const currentState = this.state.getValue();
    if (this.cache && isEqual(currentState, this.cache.state)) {
      return this.cache.placeIds;
    }

    const newPlaceIds = new Set(
      Object.keys(this.entries).filter((placeId) =>
        this.shouldBeRendered(placeId),
      ),
    );
    this.cache = {
      placeIds: newPlaceIds,
      state: currentState,
    };
    return newPlaceIds;
  }

  getState(): FilterState {
    return this.state.getValue();
  }

  update(changes: Partial<FilterState>): void {
    const priorState = this.state.getValue();
    this.state.setValue({ ...priorState, ...changes });
  }

  subscribe(observer: (state: FilterState) => void): void {
    this.state.subscribe(observer);
  }

  initialize(): void {
    this.state.initialize();
  }

  private shouldBeRendered(placeId: PlaceId): boolean {
    const state = this.state.getValue();
    const entry = this.entries[placeId];

    // Search overrides filter config.
    if (state.searchInput) {
      return state.searchInput === placeId;
    }

    const isScope = entry.scope.some((v) => state.scope.includes(v));
    const isPolicy = entry.policyChange.some((v) =>
      state.policyChange.includes(v),
    );
    const isLand = entry.landUse.some((v) => state.landUse.includes(v));
    const isStatus = state.status.includes(entry.status);

    const isAllMinimumsRepealed =
      !state.allMinimumsRepealedToggle || entry.allMinimumsRepealed;

    const population = parseInt(entry["population"]);
    const [sliderLeftIndex, sliderRightIndex] = state.populationSliderIndexes;
    const isPopulation =
      population >= POPULATION_INTERVALS[sliderLeftIndex][1] &&
      population <= POPULATION_INTERVALS[sliderRightIndex][1];

    return (
      isScope &&
      isPolicy &&
      isLand &&
      isStatus &&
      isAllMinimumsRepealed &&
      isPopulation
    );
  }
}
