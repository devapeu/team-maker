export const MAPS_ARRAY = [
  { id: "rm_air", name: "Air", active: true },
  { id: "rm_alfheim", name: "Alfheim", active: true },
  { id: "rm_anatolia", name: "Anatolia", active: false },
  { id: "rm_arena", name: "Arena", active: true },
  { id: "rm_blue_lagoon", name: "Blue Lagoon", active: true },
  { id: "rm_bamboo_grove", name: "Bamboo Grove", active: true },
  { id: "rm_black_sea", name: "Black Sea", active: false },
  { id: "rm_erebus", name: "Erebus", active: true },
  { id: "rm_elysium", name: "Elysium", active: true },
  { id: "rm_ghost_lake", name: "Ghost Lake", active: true },
  { id: "rm_giza", name: "Giza", active: true },
  { id: "rm_gold_rush", name: "Gold Rush", active: true },
  { id: "rm_highland", name: "Highland", active: false },
  { id: "rm_marsh", name: "Marsh", active: true },
  { id: "rm_megalopolis", name: "Megalopolis", active: true },
  { id: "rm_midgard", name: "Midgard", active: false },
  { id: "rm_mirkwood", name: "Mirkwood", active: false },
  { id: "rm_mount_olympus", name: "Mount Olympus", active: false },
  { id: "rm_mediterranean", name: "Mediterranean", active: false },
  { id: "rm_muspellheim", name: "Muspellheim", active: true },
  { id: "rm_nile_shallows", name: "Nile Shallows", active: true },
  { id: "rm_oasis", name: "Oasis", active: true },
  { id: "rm_savannah", name: "Savannah", active: true },
  { id: "rm_silk_road", name: "Silk Road", active: true },
  { id: "rm_steppe", name: "Steppe", active: true },
  { id: "rm_tundra", name: "Tundra", active: true },
  { id: "rm_valley_of_kings", name: "Valley of Kings", active: true },
  { id: "rm_watering_hole", name: "Watering Hole", active: true },
  { id: "rm_yellow_river", name: "Yellow River", active: true },
];

export function getMapName(id) {
  const item = MAPS_ARRAY.find(map => map.id === id);
  return item ? item.name : id;
}

export function getValidMaps() {
  return MAPS_ARRAY.filter(map => map.active === true);
}