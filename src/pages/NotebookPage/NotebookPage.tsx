import { useState } from "react";

import NoteCard from "../../features/notes/NoteCard";
import NoteForm from "../../features/notes/NoteForm";
import useNotes from "../../features/notes/useNotes";
import {
  filterNotes,
  getNoteCategories,
  sortNotes,
} from "../../features/notes/noteUtils";

import "./NotebookPage.css";

// Страница «Блокнот» (View).
// Данные и действия берёт из контроллера useNotes,
// сама только раскладывает форму и список записей.

function NotebookPage() {
  const {
    notes,
    isLoading,
    error,
    reloadNotes,
    clearError,
    handleCreateNote,
    handleTogglePin,
    handleDeleteNote,
  } = useNotes();

  const [search, setSearch] = useState("");

  //выбранная категория; null — показываем все
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = getNoteCategories(notes);

  const notesInCategory = activeCategory
    ? notes.filter((note) => note.category === activeCategory)
    : notes;

  const sortedNotes = sortNotes(filterNotes(notesInCategory, search));

  return (
    <div className="notebook-page">
      <div className="notebook-header">
        <h1>Блокнот</h1>
        <p>Мысли под рукой: запишите, пока не убежали.</p>
      </div>

      <div className="notebook-content">
        <NoteForm onCreate={(data) => void handleCreateNote(data)} />

        <section className="notebook-notes">
          <div className="notebook-notes-header">
            <h2>Мои записи</h2>
            <span>{notes.length}</span>

            <input
              type="search"
              className="notebook-search"
              placeholder="Найти заметку…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {categories.length > 0 && (
            <div className="notebook-categories">
              <button
                type="button"
                className={activeCategory === null ? "notebook-category notebook-category-active" : "notebook-category"}
                onClick={() => setActiveCategory(null)}
              >
                Все
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? "notebook-category notebook-category-active" : "notebook-category"}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="notebook-error" role="alert">
              <span>{error}</span>

              <button type="button" onClick={() => void reloadNotes()}>
                Повторить
              </button>

              <button type="button" aria-label="Скрыть ошибку" onClick={clearError}>
                ✕
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="notebook-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="notebook-skeleton" />
              ))}
            </div>
          ) : sortedNotes.length === 0 ? (
            <p className="notebook-empty">
              {search || activeCategory ? "Ничего не нашлось" : "Здесь пока пусто"}
            </p>
          ) : (
            <div className="notebook-grid">
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={handleTogglePin}
                  onDelete={(id) => void handleDeleteNote(id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default NotebookPage;
