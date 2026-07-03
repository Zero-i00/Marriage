import type * as v from "valibot";
import type {
  SchemaInvitationRequest,
  SchemaInvitationResponse,
} from "@/features/invitation/schemas/invitation.schema";

export type TypeInvitationRequest = v.InferInput<
  typeof SchemaInvitationRequest
>;

export type TypeInvitationResponse = v.InferInput<
  typeof SchemaInvitationResponse
>;
