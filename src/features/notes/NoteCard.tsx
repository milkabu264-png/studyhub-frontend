import type { Note } from "../../types/note";
import { getNoteDateLabel } from "./noteUtils";
import "./NoteCard.css";

interface NoteCardProps {
  note: Note;
  onTogglePin: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: number) => void;
}

//линейные иконки для кнопок карточки
const ICONS = {
  pin: "M9 4h6l-1 6 3 3v2H7v-2l3-3-1-6ZM12 15v5",
  edit: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4",
  delete: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
};

function Icon({ path, filled = false }: { path: string; filled?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

//карточка одной заметки: заголовок, текст, категория и дата

export default function NoteCard({
  note,
  onTogglePin,
  onEdit,
  onDelete,
}: NoteCardProps) {
  return (
    <article className={note.isPinned ? "note-card note-card-pinned" : "note-card"}>
      <div className="note-card-header">
        {/* заголовок необязателен — если его нет, сразу показываем текст */}
        {note.title && <h3>{note.title}</h3>}

        <div className="note-card-actions">
          <button
            type="button"
            className="note-card-button note-card-hidden"
            aria-label="Изменить заметку"
            title="Изменить"
            onClick={() => onEdit(note)}
          >
            <Icon path={ICONS.edit} />
          </button>

          <button
            type="button"
            className="note-card-button note-card-hidden note-card-delete"
            aria-label="Удалить заметку"
            title="Удалить"
            onClick={() => onDelete(note.id)}
          >
            <Icon path={ICONS.delete} />
          </button>

          <button
            type="button"
            className="note-card-button note-card-pin"
            aria-label={note.isPinned ? "Открепить заметку" : "Закрепить заметку"}
            title={note.isPinned ? "Открепить" : "Закрепить"}
            onClick={() => onTogglePin(note)}
          >
            <Icon path={ICONS.pin} filled={note.isPinned} />
          </button>
        </div>
      </div>

      <p className="note-card-text">{note.text}</p>

      <div className="note-card-footer">
        {note.category && (
          <span className="note-card-category">{note.category}</span>
        )}

        <span className="note-card-date">{getNoteDateLabel(note.updatedAt)}</span>
      </div>
    </article>
  );
}
