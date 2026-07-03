import type * as v from "valibot";
import type {
  SchemaDrinkRequest,
  SchemaDrinkResponse,
} from "@/features/invitation/schemas/drink.schema";

export type TypeDrinkRequest = v.InferInput<typeof SchemaDrinkRequest>;

export type TypeDrinkResponse = v.InferInput<typeof SchemaDrinkResponse>;
