/**
 * Which icon field an icon value belongs to. Before the full lucide set, each
 * block had its own small palette stored as short keys, and the same key could
 * mean different icons in different blocks (`message`, `calendar`, `check`),
 * so old values can only be read in the context of their block.
 */
export type IconScope =
  | "feature"
  | "programme"
  | "category"
  | "callout"
  | "contact"
  | "program-header"
  | "partner-collection"
  | "library";

/**
 * Each block's former palette: legacy key → canonical lucide name of the glyph
 * it rendered. Frozen — never add to these; new picks are stored prefixed.
 * `partners` reused the Feature Cards palette; library categories used the
 * Category Grid one.
 */
const FEATURE = {
  book: "book-open",
  users: "users",
  award: "award",
  globe: "globe",
  graduation: "graduation-cap",
  library: "library",
  layers: "layers",
  file: "file-text",
  zap: "zap",
  calendar: "calendar",
  chart: "chart-column",
  check: "square-check-big",
};

const CATEGORY = {
  folder: "folder",
  settings: "settings",
  scale: "scale",
  message: "message-square",
  trending: "trending-up",
  users: "users",
  award: "award",
  book: "book-open",
  globe: "globe",
  heart: "heart",
  briefcase: "briefcase",
  calendar: "calendar",
};

export const LEGACY_ICONS: Record<IconScope, Record<string, string>> = {
  feature: FEATURE,
  programme: FEATURE,
  category: CATEGORY,
  library: CATEGORY,
  callout: {
    megaphone: "megaphone",
    sparkles: "sparkles",
    rocket: "rocket",
    star: "star",
    heart: "heart",
    "hand-heart": "hand-heart",
    info: "info",
    bell: "bell",
    gift: "gift",
    party: "party-popper",
    flag: "flag",
    zap: "zap",
    check: "circle-check-big",
    alert: "circle-alert",
    "thumbs-up": "thumbs-up",
    users: "users",
    calendar: "calendar",
    mail: "mail",
    message: "message-circle",
    book: "book-open",
    graduation: "graduation-cap",
    target: "target",
    trophy: "trophy",
    lightbulb: "lightbulb",
    shield: "shield",
    globe: "globe",
  },
  contact: {
    "map-pin": "map-pin",
    phone: "phone",
    smartphone: "smartphone",
    mail: "mail",
    clock: "clock",
    globe: "globe",
    building: "building-complex",
    user: "user",
    "message-circle": "message-circle",
    printer: "printer",
    calendar: "calendar-days",
    info: "info",
  },
  "program-header": {
    layers: "layers",
    rocket: "rocket",
    graduation: "graduation-cap",
    users: "users",
    handshake: "handshake",
    building: "building-complex",
    landmark: "landmark",
    globe: "globe",
    award: "award",
    trophy: "trophy",
    target: "target",
    compass: "compass",
    sparkles: "sparkles",
    star: "star",
    lightbulb: "lightbulb",
    book: "book-open",
    briefcase: "briefcase",
    calendar: "calendar",
    chart: "chart-column",
    heart: "heart",
    leaf: "leaf",
    shield: "shield",
  },
  "partner-collection": {
    building: "building-complex",
    landmark: "landmark",
    handshake: "handshake",
    globe: "globe",
    users: "users",
    award: "award",
    briefcase: "briefcase",
    flag: "flag",
    shield: "shield",
    star: "star",
    sparkles: "sparkles",
    target: "target",
    book: "book-open",
    graduation: "graduation-cap",
    leaf: "leaf",
    heart: "heart",
    banknote: "banknote",
    gift: "gift",
    network: "network",
    trophy: "trophy",
    lightbulb: "lightbulb",
    compass: "compass",
  },
};

/**
 * What the picker shows before anything is searched: every icon any block
 * offered before, so the familiar choices are one click away.
 */
export const RECOMMENDED_ICONS: string[] = [
  ...new Set(Object.values(LEGACY_ICONS).flatMap((map) => Object.values(map))),
];
