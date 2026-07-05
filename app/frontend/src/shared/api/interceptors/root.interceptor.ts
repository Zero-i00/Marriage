import ky from "ky";

import { SERVER_API_URL } from "@/shared/configs/api.config";

export const rootClient = ky.create({
  prefix: SERVER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
});
