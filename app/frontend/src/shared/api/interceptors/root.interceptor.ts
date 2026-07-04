import ky from "ky";

import {SERVER_API_URL} from "@/shared/configs/api.config";

export const rootClient = ky.create({
  baseUrl: SERVER_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
});
