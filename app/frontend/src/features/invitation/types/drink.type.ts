import type * as v from "valibot";
import type { SchemaDrinkResponse } from "@/features/invitation/schemas/drink.schema";

export type TypeDrinkResponse = v.InferInput<typeof SchemaDrinkResponse>;
