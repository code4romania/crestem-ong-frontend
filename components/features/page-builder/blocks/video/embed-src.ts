import { parseVideoId, type VideoData } from "./schema";

/**
 * YouTube/Vimeo embed URL with the player options folded into the query.
 *
 * `autoplay=1` is unconditional: the facade mounts the iframe only once the
 * visitor has clicked play, so arriving here already means "start it". The
 * block's own `autoplay` flag stays meaningful for uploaded files only.
 *
 * Returns `null` for uploaded files and for links that don't parse, which is
 * what the renderer falls back on.
 */
export function getEmbedSrc(data: VideoData): string | null {
  if (data.sursaTip === "fisier") return null;
  const id = parseVideoId(data.sursaTip, data.sursaUrl);
  if (!id) return null;

  const params = new URLSearchParams();
  params.set("autoplay", "1");

  if (data.sursaTip === "youtube") {
    params.set("rel", "0");
    if (data.mut) params.set("mute", "1");
    if (!data.controale) params.set("controls", "0");
    if (data.loop) {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  }

  if (data.mut) params.set("muted", "1");
  if (!data.controale) params.set("controls", "0");
  if (data.loop) params.set("loop", "1");
  return `https://player.vimeo.com/video/${id}?${params.toString()}`;
}
