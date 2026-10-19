import { USE_MOCKS, apiRequest } from "./api";
import { mockCampfire } from "../mocks/mockServer";
import type { Campfire } from "../types/campfire";

export function getCampfire() {
  if (USE_MOCKS) return mockCampfire.get();

  return apiRequest<Campfire>(
    "/campfire",
  );
}
