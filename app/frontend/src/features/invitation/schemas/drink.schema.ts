import * as v from "valibot";
import { INVALID_REQUIRED } from "@/shared/constants/error.constant";

export const SchemaDrinkRequest = v.object({
  title: v.pipe(v.string(), v.nonEmpty(INVALID_REQUIRED)),
});

export const SchemaDrinkResponse = v.object({
  id: v.number(),
  title: v.string(),
});
