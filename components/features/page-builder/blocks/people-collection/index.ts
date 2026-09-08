import { UsersRound } from "lucide-react";
import { defineBlock } from "../../types";
import { PeopleCollectionEditor } from "./Editor";
import { PeopleCollection } from "./PeopleCollection";
import {
  peopleCollectionSchema,
  PEOPLE_COLLECTION_DEFAULTS,
} from "./schema";

export const peopleCollectionBlock = defineBlock({
  type: "people-collection",
  category: "dynamic",
  name: "People Collection",
  description: "Colecție dinamică de persoane din sistem",
  icon: UsersRound,
  schema: peopleCollectionSchema,
  defaults: PEOPLE_COLLECTION_DEFAULTS,
  Editor: PeopleCollectionEditor,
  Renderer: PeopleCollection,
});
