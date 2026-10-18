import type { Note } from "../types/note.ts";

//дата-время n часов назад — чтобы в моках были заметки «сегодня» и «вчера»
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const mockNotes: Note[] = [
  {
    id: 1,
    title: "Идеи для презентации",
    text: "Начать с истории клиента. Меньше текста, больше живых примеров.",
    category: "Работа",
    isPinned: true,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
  },
  {
    id: 2,
    title: "Мой спокойный понедельник",
    text: "Три важных дела, прогулка и немного времени для себя.",
    category: "Личное",
    isPinned: false,
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    id: 3,
    title: null,
    text: "Спросить у преподавателя про формат отчёта по ООП: нужна ли UML-диаграмма классов.",
    category: "Учёба",
    isPinned: false,
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(26),
  },
  {
    id: 4,
    title: "Книги на осень",
    text: "«Чистый код», «Грокаем алгоритмы», что-нибудь художественное для отдыха.",
    category: null,
    isPinned: false,
    createdAt: hoursAgo(50),
    updatedAt: hoursAgo(50),
  },
];
