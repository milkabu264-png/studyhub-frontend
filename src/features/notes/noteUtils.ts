import type { Note } from "../../types/note";

// Вспомогательные функции для заметок — без React, только логика над массивом.

//закреплённые сверху, внутри — самые свежие первыми
export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

//поиск по заголовку и тексту, без учёта регистра
export function filterNotes(notes: Note[], search: string): Note[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return notes;
  }

  return notes.filter((note) =>
    `${note.title ?? ""} ${note.text}`.toLowerCase().includes(query),
  );
}

//«Сегодня, 12:40» / «Вчера, 09:10» / «16 октября»
export function getNoteDateLabel(isoDate: string): string {
  const date = new Date(isoDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const days = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (days === 0) return `Сегодня, ${time}`;
  if (days === 1) return `Вчера, ${time}`;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

//все категории, которые встречаются в заметках, — для фильтра
export function getNoteCategories(notes: Note[]): string[] {
  const categories = notes
    .map((note) => note.category)
    .filter((category): category is string => Boolean(category));

  return [...new Set(categories)].sort();
}
