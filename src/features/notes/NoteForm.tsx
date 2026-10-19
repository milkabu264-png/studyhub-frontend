import { useState, type FormEvent } from "react";

import { NOTE_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "../../types/note";
import type {
  CreateNoteRequest,
  Note,
  UpdateNoteRequest,
} from "../../types/note";

import "./NoteForm.css";

interface NoteFormProps {
  //возвращают текст ошибки сервера или null, если всё сохранилось
  onCreate: (note: CreateNoteRequest) => Promise<string | null>;
  //заметка, которую сейчас редактируют; null — создаём новую
  editingNote?: Note | null;
  onUpdate?: (id: number, note: UpdateNoteRequest) => Promise<string | null>;
  onCancelEdit?: () => void;
}

//форма «Новая запись» (п. 1.4.1): заголовок до 200 символов и текст до 5000 — оба обязательны.
//Если передана editingNote — та же форма работает как редактирование (п. 1.4.3).

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

  const [errors, setErrors] = useState<{ title?: string; text?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setTitle("");
    setText("");
    setCategory("");
    setErrors({});
  }

  function validate() {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Введите заголовок";
    } else if (title.trim().length > NOTE_TITLE_MAX_LENGTH) {
      newErrors.title = "Запись слишком длинная";
    }

    if (!text.trim()) {
      newErrors.text = "Запись не может быть пустой";
    } else if (text.length > NOTE_MAX_LENGTH) {
      newErrors.text = "Запись слишком длинная";
    }

    return newErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const data = {
      title: title.trim(),
      text: text.trim(),
      category: category.trim() || null,
    };

    setIsSaving(true);
    setServerError(null);

    const error =
      editingNote && onUpdate
        ? await onUpdate(editingNote.id, { ...data, isPinned: editingNote.isPinned })
        : await onCreate(data);

    setIsSaving(false);

    if (error) {
      setServerError(error);
      return;
    }

    if (!editingNote) {
      resetForm();
    }
  }

  return (
    <form
      className={editingNote ? "note-form note-form-editing" : "note-form"}
      onSubmit={handleSubmit}
      noValidate
    >
      <h2>{editingNote ? "Редактирование" : "Новая запись"}</h2>

      <label>
        Заголовок

        <input
          id="noteTitle"
          type="text"
          placeholder="Например: идеи для презентации"
          maxLength={NOTE_TITLE_MAX_LENGTH + 1}
          value={title}
          className={errors.title ? "input-error" : ""}
          onChange={(event) => {
            setTitle(event.target.value);
            setErrors({ ...errors, title: undefined });
          }}
        />

        {errors.title && <span className="error-text">{errors.title}</span>}
      </label>

      <label>
        Текст

        <textarea
          id="noteText"
          maxLength={NOTE_MAX_LENGTH}
          placeholder="Введите текст заметки"
          value={text}
          className={errors.text ? "input-error" : ""}
          onChange={(event) => {
            setText(event.target.value);
            setErrors({ ...errors, text: undefined });
          }}
        />

        <span className="note-form-hint">
          {errors.text ? (
            <span className="error-text">{errors.text}</span>
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
          placeholder="Необязательно, например: Учёба"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </label>

      {serverError && <p className="note-form-server-error" role="alert">{serverError}</p>}

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

        <button type="submit" className="note-form-submit" disabled={isSaving}>
          {isSaving ? "Сохраняем…" : editingNote ? "Сохранить изменения" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
