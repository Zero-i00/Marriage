import ky from "ky";
import { ROOT_APP_HEADER } from "@/shared/api/api.utils";

import {SERVER_API_URL} from "@/shared/configs/api.config";

export const rootClient = ky.create({
  baseUrl: SERVER_API_URL,
  headers: ROOT_APP_HEADER,
  credentials: "include",
});
