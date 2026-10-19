export interface Note {
  id: number;

  title: string;
  text: string;

  category: string | null;

  isPinned: boolean;

  createdAt: string;
  updatedAt: string;
}

//интерфейс заметки: заголовок (до 200 символов) и текст (до 5000 символов) обязательны,
//isPinned — закреплённая заметка показывается первой.

export interface CreateNoteRequest {
  title: string;
  text: string;
  category: string | null;
}

//данные для создания заметки — id, даты и закрепление выставляет сервер.

export interface UpdateNoteRequest {
  title: string;
  text: string;
  category: string | null;
  isPinned: boolean;
}

//данные для изменения заметки (в том числе закрепить / открепить).

export const NOTE_MAX_LENGTH = 5000;
export const NOTE_TITLE_MAX_LENGTH = 200;
