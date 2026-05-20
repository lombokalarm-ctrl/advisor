import imageUrlBuilder from "@sanity/image-url";

import { dataset, projectId } from "./client";

const builder = projectId && dataset ? imageUrlBuilder({ projectId, dataset }) : null;

export function urlForImage(source: unknown) {
  return builder?.image(source);
}
