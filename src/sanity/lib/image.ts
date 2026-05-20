import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

import { dataset, projectId } from "./client";

const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null;

export function urlForImage(source: SanityImageSource) {
  return builder?.image(source);
}
