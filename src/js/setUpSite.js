import { Map, TileLayer, CircleMarker, Control, DomUtil } from "leaflet";
import "leaflet/dist/leaflet.css";

import setUpIcons from "./fontAwesome";
import addLegend from "./legend";
import setUpSearch from "./search";
import setUpAbout from "./about";

const BASE_LAYER = new TileLayer(
  "https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}",
  {
    attribution:
      'Map tiles: <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>',
    subdomains: "abcd",
    minZoom: 0,
    maxZoom: 10,
    ext: "png",
  }
);

const SCOPE_TO_COLOR = {
  Regional: "#7b3294",
  "City Center": "#fdae61",
  Citywide: "#d7191c",
  "Main Street": "#abdda4",
  TOD: "#2b83ba",
};

const createMap = () => {
  const map = new Map("map", {
    layers: [BASE_LAYER],
  });
  map.setView([43.2796758, -96.7449732], 4); // Set default view (lat, long) to United States
  map.attributionControl.setPrefix(
    'Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  );
  return map;
};

const setUpCityPointsLayer = (map, data) => {
  data.forEach((entry) => {
    const marker = new CircleMarker([entry.lat, entry.long], {
      radius: 7,
      stroke: true,
      weight: 0.9,
      color: "#FFFFFF",
      fillColor: SCOPE_TO_COLOR[entry.magnitude_encoded],
      fillOpacity: 1,
    });
    marker.bindTooltip(`${entry.city}, ${entry.state}`);
    marker.addTo(map);
  });
};

const setUpSite = async () => {
  setUpIcons();
  setUpAbout();
  const map = createMap();
  addLegend(map, SCOPE_TO_COLOR);

  const data = await import("../../map/tidied_map_data.csv");
  setUpSearch(data);
  setUpCityPointsLayer(map, data);
};

export default setUpSite;
