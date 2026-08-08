import type { PortableTextNode } from "@/types/content";

function createTextBlock(text: string, key: string, style: "normal" | "h2" | "h3" | "blockquote" = "normal"): PortableTextNode {
  return {
    _key: key,
    _type: "block",
    style,
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function createBulletBlock(text: string, key: string): PortableTextNode {
  return {
    _key: key,
    _type: "block",
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

export function portableTextToPlainText(content?: PortableTextNode[]) {
  if (!content?.length) {
    return "";
  }

  return content
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) {
        return "";
      }

      const text = block.children
        .map((child) => (child && typeof child === "object" && "text" in child && typeof child.text === "string" ? child.text : ""))
        .join("")
        .trim();

      if (!text) {
        return "";
      }

      if (block.style === "h2") {
        return `## ${text}`;
      }

      if (block.style === "h3") {
        return `### ${text}`;
      }

      if (block.style === "blockquote") {
        return `> ${text}`;
      }

      if (block.listItem === "bullet") {
        return `- ${text}`;
      }

      return text;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function plainTextToPortableText(value: string) {
  const sections = value
    .split(/\r?\n\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return sections.flatMap((section, index) => {
    const lines = section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (!lines.length) {
      return [];
    }

    if (lines.every((line) => line.startsWith("- "))) {
      return lines.map((line, bulletIndex) => createBulletBlock(line.replace(/^- /, "").trim(), `block-${index + 1}-${bulletIndex + 1}`));
    }

    const text = lines.join(" ");

    if (text.startsWith("## ")) {
      return [createTextBlock(text.replace(/^## /, "").trim(), `block-${index + 1}`, "h2")];
    }

    if (text.startsWith("### ")) {
      return [createTextBlock(text.replace(/^### /, "").trim(), `block-${index + 1}`, "h3")];
    }

    if (text.startsWith("> ")) {
      return [createTextBlock(text.replace(/^> /, "").trim(), `block-${index + 1}`, "blockquote")];
    }

    return [createTextBlock(text, `block-${index + 1}`, "normal")];
  });
}
