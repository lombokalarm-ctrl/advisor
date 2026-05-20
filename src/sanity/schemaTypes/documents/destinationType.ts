import { defineArrayMember, defineField, defineType } from "sanity";

export const destinationType = defineType({
  name: "destination",
  title: "Destination",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "category", title: "Category", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "highlight", title: "Highlight", type: "string" }),
    defineField({ name: "mainImage", title: "Main Image", type: "galleryImage" }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [defineArrayMember({ type: "galleryImage" })],
    }),
    defineField({ name: "content", title: "Content", type: "blockContent" }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
    }),
    defineField({
      name: "recommendations",
      title: "Recommendations",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({ name: "ctaMessage", title: "CTA Message", type: "string" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "metaDescription", title: "Meta Description", type: "text", rows: 3 }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
    },
  },
});
