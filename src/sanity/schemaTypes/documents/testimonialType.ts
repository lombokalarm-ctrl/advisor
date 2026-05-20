import { defineField, defineType } from "sanity";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "customerName", title: "Customer Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "location", title: "Origin City", type: "string" }),
    defineField({ name: "tripType", title: "Trip Type", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (rule) => rule.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({ name: "featured", title: "Featured on homepage", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "tripType",
    },
  },
});
