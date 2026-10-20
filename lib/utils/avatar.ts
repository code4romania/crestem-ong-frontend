import { hashIndex } from "./hash";

// Fixed palette so each avatar without an image gets a stable, distinct circle
// color (hashed from its id) instead of every one looking the same.
const AVATAR_COLORS = ["#7c3aed", "#5656e5", "#0f766e", "#15803d", "#c2410c", "#be185d", "#4f46e5"];

export function avatarColorFor(id: string) {
  return AVATAR_COLORS[hashIndex(id, AVATAR_COLORS.length)];
}
