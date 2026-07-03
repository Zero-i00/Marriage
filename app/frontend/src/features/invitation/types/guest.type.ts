import type * as v from "valibot";
import type {
  SchemaGuestRequest,
  SchemaGuestResponse,
} from "@/features/invitation/schemas/guest.schema";

export type TypeGuestRequest = v.InferInput<typeof SchemaGuestRequest>;

export type TypeGuestResponse = v.InferInput<typeof SchemaGuestResponse>;
