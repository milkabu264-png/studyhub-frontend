import { useEffect, useState } from "react";

import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../../services/noteApi";
import { USE_MOCKS } from "../../services/api";
import { mockNotes } from "../../mocks/notes";

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
      const data = USE_MOCKS ? mockNotes : await getNotes();
      setNotes(data);
    } catch (e) {
      setError(getErrorMessage(e));
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

  async function handleCreateNote(data: CreateNoteRequest) {
    try {
      if (USE_MOCKS) {
        const now = new Date().toISOString();

        const newNote: Note = {
          id: Date.now(),
          title: data.title,
          text: data.text,
          category: data.category,
          isPinned: false,
          createdAt: now,
          updatedAt: now,
        };

        setNotes((currentNotes) => [newNote, ...currentNotes]);
        return;
      }

      const created = await createNote(data);
      setNotes((currentNotes) => [created, ...currentNotes]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleUpdateNote(id: number, data: UpdateNoteRequest) {
    try {
      if (USE_MOCKS) {
        const note = notes.find((item) => item.id === id);

        if (note) {
          replaceNote({ ...note, ...data, updatedAt: new Date().toISOString() });
        }

        return;
      }

      replaceNote(await updateNote(id, data));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  //закрепить / открепить — это обычное изменение заметки
  function handleTogglePin(note: Note) {
    void handleUpdateNote(note.id, {
      title: note.title,
      text: note.text,
      category: note.category,
      isPinned: !note.isPinned,
    });
  }

  async function handleDeleteNote(id: number) {
    try {
      if (!USE_MOCKS) {
        await deleteNote(id);
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch (e) {
      setError(getErrorMessage(e));
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

//apiRequest бросает Error с текстом от сервера, fetch без сервера — TypeError
function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером";
  }

  return error instanceof Error ? error.message : "Что-то пошло не так";
}
