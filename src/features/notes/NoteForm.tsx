import { useState, type FormEvent } from "react";

import { NOTE_MAX_LENGTH } from "../../types/note";
import type {
  CreateNoteRequest,
  Note,
  UpdateNoteRequest,
} from "../../types/note";

import "./NoteForm.css";

interface NoteFormProps {
  onCreate: (note: CreateNoteRequest) => void;
  //заметка, которую сейчас редактируют; null — создаём новую
  editingNote?: Note | null;
  onUpdate?: (id: number, note: UpdateNoteRequest) => void;
  onCancelEdit?: () => void;
}

//форма «Новая запись»: заголовок и категория необязательны, текст — обязателен.
//Если передана editingNote — та же форма работает как редактирование.

export default function NoteForm({
  onCreate,
  editingNote = null,
  onUpdate,
  onCancelEdit,
}: NoteFormProps) {
  //при редактировании поля сразу заполнены данными заметки
  const [title, setTitle] = useState(editingNote?.title ?? "");
  const [text, setText] = useState(editingNote?.text ?? "");
  const [category, setCategory] = useState(editingNote?.category ?? "");

  const [textError, setTextError] = useState(false);

  function resetForm() {
    setTitle("");
    setText("");
    setCategory("");
    setTextError(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      setTextError(true);
      return;
    }

    const data = {
      title: title.trim() || null,
      text: text.trim(),
      category: category.trim() || null,
    };

    if (editingNote && onUpdate) {
      onUpdate(editingNote.id, { ...data, isPinned: editingNote.isPinned });
      return;
    }

    onCreate(data);

    resetForm();
  }

  return (
    <form
      className={editingNote ? "note-form note-form-editing" : "note-form"}
      onSubmit={handleSubmit}
    >
      <h2>{editingNote ? "Редактирование" : "Новая запись"}</h2>

      <label>
        Заголовок

        <input
          type="text"
          placeholder="Заголовок необязателен"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>

      <label>
        Текст

        <textarea
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Введите текст заметки"
          value={text}
          className={textError ? "input-error" : ""}
          onChange={(event) => {
            setText(event.target.value);

            if (textError) {
              setTextError(false);
            }
          }}
        />

        <span className="note-form-hint">
          {textError ? (
            <span className="error-text">Напишите хотя бы пару слов</span>
          ) : (
            <span />
          )}

          {/* счётчик символов */}
          <span>
            {text.length} / {NOTE_MAX_LENGTH}
          </span>
        </span>
      </label>

      <label>
        Категория

        <input
          type="text"
          placeholder="Например: Учёба"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </label>

      <div className="note-form-actions">
        {editingNote && onCancelEdit && (
          <button
            type="button"
            className="note-form-cancel"
            onClick={onCancelEdit}
          >
            Отмена
          </button>
        )}

        <button type="submit" className="note-form-submit">
          {editingNote ? "Сохранить изменения" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
