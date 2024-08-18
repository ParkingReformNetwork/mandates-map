export type PlaceId = string;

export interface PlaceEntry {
  place: string;
  state: string;
  country: string;
  summary: string;
  status: string;
  policyChange: string[];
  scope: string[];
  landUse: string[];
  reformDate: string;
  allMinimumsRepealed: boolean;
  population: number;
  url: string;
  lat: string;
  long: string;
}
