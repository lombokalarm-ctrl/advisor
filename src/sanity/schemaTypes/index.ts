import type { SchemaTypeDefinition } from "sanity";

import { articleType } from "./documents/articleType";
import { destinationType } from "./documents/destinationType";
import { packageType } from "./documents/packageType";
import { testimonialType } from "./documents/testimonialType";
import { blockContentType } from "./objects/blockContentType";
import { faqItemType } from "./objects/faqItemType";
import { galleryImageType } from "./objects/galleryImageType";

export const schemaTypes: SchemaTypeDefinition[] = [
  blockContentType,
  faqItemType,
  galleryImageType,
  packageType,
  destinationType,
  articleType,
  testimonialType,
];
