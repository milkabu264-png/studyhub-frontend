export interface Note {
  id: number;

  title: string | null;
  text: string;

  category: string | null;

  isPinned: boolean;

  createdAt: string;
  updatedAt: string;
}

//интерфейс заметки: заголовок необязателен, текст — обязателен (до 5000 символов),
//isPinned — закреплённая заметка показывается первой.

export interface CreateNoteRequest {
  title: string | null;
  text: string;
  category: string | null;
}

//данные для создания заметки — id, даты и закрепление выставляет сервер.

export interface UpdateNoteRequest {
  title: string | null;
  text: string;
  category: string | null;
  isPinned: boolean;
}

//данные для изменения заметки (в том числе закрепить / открепить).

export const NOTE_MAX_LENGTH = 5000;
