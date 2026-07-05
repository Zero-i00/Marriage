import * as v from "valibot";

export const SchemaDrinkResponse = v.object({
  id: v.number(),
  title: v.string(),
});
