import NoteCard from "../../features/notes/NoteCard";
import NoteForm from "../../features/notes/NoteForm";
import useNotes from "../../features/notes/useNotes";
import { sortNotes } from "../../features/notes/noteUtils";

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

  const sortedNotes = sortNotes(notes);

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
          </div>

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
            <p className="notebook-empty">Здесь пока пусто</p>
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
