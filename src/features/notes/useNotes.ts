import { useEffect, useState } from "react";

import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../../services/noteApi";
import { getErrorMessage } from "../../services/api";
import { failure, success } from "../../shared/result";
import type { ActionResult } from "../../shared/result";

import type {
  CreateNoteRequest,
  Note,
  UpdateNoteRequest,
} from "../../types/note";

// CONTROLLER заметок (C в MVC) — устроен так же, как useTasks.
//
// Связывает Model (types/note.ts + services/noteApi.ts) и View (NotebookPage, NoteCard, NoteForm):
//  - загружает заметки;
//  - хранит их в состоянии;
//  - создаёт, изменяет, закрепляет и удаляет заметки.

export default function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotes() {
    setIsLoading(true);
    setError(null);

    try {
      setNotes(await getNotes());
    } catch (e) {
      setError(getErrorMessage(e, "Не удалось загрузить записи. Попробуйте позже"));
    } finally {
      setIsLoading(false);
    }
  }

  //загружаем заметки один раз при открытии страницы
  useEffect(() => {
    void loadNotes();
  }, []);

  function replaceNote(updated: Note) {
    setNotes((currentNotes) =>
      currentNotes.map((note) => (note.id === updated.id ? updated : note)),
    );
  }

  async function handleCreateNote(data: CreateNoteRequest): Promise<ActionResult<Note>> {
    try {
      const created = await createNote(data);
      //новая запись — в начале списка
      setNotes((currentNotes) => [created, ...currentNotes]);
      return success(created);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось сохранить запись. Попробуйте позже"));
    }
  }

  async function handleUpdateNote(id: number, data: UpdateNoteRequest): Promise<ActionResult<Note>> {
    try {
      const updated = await updateNote(id, data);
      replaceNote(updated);
      return success(updated);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось сохранить. Попробуйте позже"));
    }
  }

  //закрепить / открепить — это обычное изменение заметки
  function handleTogglePin(note: Note) {
    return handleUpdateNote(note.id, {
      title: note.title,
      text: note.text,
      category: note.category,
      isPinned: !note.isPinned,
    });
  }

  async function handleDeleteNote(id: number): Promise<ActionResult> {
    try {
      await deleteNote(id);
      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
      return success(undefined);
    } catch (e) {
      return failure(getErrorMessage(e, "Не удалось удалить. Попробуйте позже"));
    }
  }

  return {
    notes,
    isLoading,
    error,
    reloadNotes: loadNotes,
    clearError: () => setError(null),
    handleCreateNote,
    handleUpdateNote,
    handleTogglePin,
    handleDeleteNote,
  };
}
