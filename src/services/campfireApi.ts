import { apiRequest } from "./api";
import type { Campfire } from "../types/campfire";

export function getCampfire() {
  return apiRequest<Campfire>(
    "/campfire",
  );
}