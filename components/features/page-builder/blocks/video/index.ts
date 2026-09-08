import { Video as VideoIcon } from "lucide-react";
import { defineBlock } from "../../types";
import { VideoEditor } from "./Editor";
import { Video } from "./Video";
import { videoSchema, VIDEO_DEFAULTS } from "./schema";

export const videoBlock = defineBlock({
  type: "video",
  category: "media",
  name: "Material video",
  description: "Embed YouTube/Vimeo sau fișier video, cu legendă și opțiuni de player",
  icon: VideoIcon,
  schema: videoSchema,
  defaults: VIDEO_DEFAULTS,
  Editor: VideoEditor,
  Renderer: Video,
});
