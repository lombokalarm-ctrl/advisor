import { describe, expect, it } from "vitest";

import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("membangun canonical dan open graph sesuai path", () => {
    const metadata = buildMetadata({
      title: "Paket Wisata Lombok",
      description: "Deskripsi layanan paket wisata Lombok.",
      path: "/paket-wisata-lombok",
      keywords: ["paket wisata lombok"],
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://lombokadvisor.com/paket-wisata-lombok",
    );
    expect(metadata.openGraph?.url).toBe("https://lombokadvisor.com/paket-wisata-lombok");
    expect(metadata.keywords).toContain("paket wisata lombok");
  });
});
