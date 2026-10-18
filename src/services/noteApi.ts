import { apiRequest } from "./api";

import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "../types/note.ts";

export function getNotes() {
  return apiRequest<Note[]>(
    "/notes",
  );
}

export function createNote(
  data: CreateNoteRequest,
) {
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
  return apiRequest<void>(
    `/notes/${id}`,
    {
      method: "DELETE",
    },
  );
}
