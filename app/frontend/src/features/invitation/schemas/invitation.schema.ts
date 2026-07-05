import * as v from "valibot";
import { SchemaDrinkResponse } from "@/features/invitation/schemas/drink.schema";
import {
  SchemaGuestRequest,
  SchemaGuestResponse,
} from "@/features/invitation/schemas/guest.schema";

export const SchemaInvitationRequest = v.object({
  is_plan_visit: v.boolean(),
  music: v.optional(v.string()),
  comment: v.optional(v.string()),
  drink_ids: v.array(v.number()),
  guests: v.array(SchemaGuestRequest),
});

export const SchemaInvitationResponse = v.object({
  id: v.number(),
  is_plan_visit: v.boolean(),

  music: v.optional(v.string()),
  comment: v.optional(v.string()),

  guests: v.array(SchemaGuestResponse),
  drinks: v.array(SchemaDrinkResponse),

  created_at: v.string(),
  updated_at: v.string(),
});
