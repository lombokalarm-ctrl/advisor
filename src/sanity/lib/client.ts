import { createClient } from "next-sanity";

import { apiVersion } from "./api-version";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "";
export const token = process.env.SANITY_API_READ_TOKEN;

export const isSanityConfigured = Boolean(projectId && dataset);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      token,
    })
  : null;
