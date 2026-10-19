import { USE_MOCKS, apiRequest } from "./api";
import { mockNotes } from "../mocks/mockServer";

import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "../types/note.ts";

export function getNotes() {
  if (USE_MOCKS) return mockNotes.getAll();

  return apiRequest<Note[]>(
    "/notes",
  );
}

export function createNote(
  data: CreateNoteRequest,
) {
  if (USE_MOCKS) return mockNotes.create(data);

  return apiRequest<Note>(
    "/notes",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateNote(
  id: number,
  data: UpdateNoteRequest,
) {
  if (USE_MOCKS) return mockNotes.update(id, data);

  return apiRequest<Note>(
    `/notes/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export function deleteNote(
  id: number,
) {
  if (USE_MOCKS) return mockNotes.remove(id);

  return apiRequest<void>(
    `/notes/${id}`,
    {
      method: "DELETE",
    },
  );
}
