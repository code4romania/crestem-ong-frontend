import { Handshake } from "lucide-react";
import { defineBlock } from "../../types";
import { PartnerCollectionEditor } from "./Editor";
import { PartnerCollection } from "./PartnerCollection";
import {
  partnerCollectionSchema,
  PARTNER_COLLECTION_DEFAULTS,
} from "./schema";

export const partnerCollectionBlock = defineBlock({
  type: "partner-collection",
  category: "dynamic",
  name: "Partner Collection",
  description: "Bandă de parteneri / finanțatori cu logo și nume",
  icon: Handshake,
  schema: partnerCollectionSchema,
  defaults: PARTNER_COLLECTION_DEFAULTS,
  Editor: PartnerCollectionEditor,
  Renderer: PartnerCollection,
});
