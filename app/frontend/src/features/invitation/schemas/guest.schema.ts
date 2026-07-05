import * as v from "valibot";
import { INVALID_REQUIRED } from "@/shared/constants/error.constant";

export const SchemaGuestRequest = v.object({
  full_name: v.pipe(v.string(), v.nonEmpty(INVALID_REQUIRED)),
});

export const SchemaGuestResponse = v.object({
  id: v.number(),
  full_name: v.string(),
  invitation_id: v.number(),
});
