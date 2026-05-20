import { defineField, defineType } from "sanity";

export const galleryImageType = defineType({
  name: "galleryImage",
  title: "Gallery Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "alt", title: "Alt Text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: {
      title: "caption",
      media: "image",
      subtitle: "alt",
    },
    prepare({ title, media, subtitle }) {
      return {
        title: title || "Gallery image",
        subtitle: subtitle || "Image asset",
        media,
      };
    },
  },
});
