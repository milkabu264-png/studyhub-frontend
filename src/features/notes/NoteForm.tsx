import { useState, type FormEvent } from "react";

import { NOTE_MAX_LENGTH } from "../../types/note";
import type { CreateNoteRequest } from "../../types/note";

import "./NoteForm.css";

interface NoteFormProps {
  onCreate: (note: CreateNoteRequest) => void;
}

//форма «Новая запись»: заголовок и категория необязательны, текст — обязателен

export default function NoteForm({ onCreate }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");

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

    onCreate({
      title: title.trim() || null,
      text: text.trim(),
      category: category.trim() || null,
    });

    resetForm();
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2>Новая запись</h2>

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
        <button type="submit" className="note-form-submit">
          Сохранить
        </button>
      </div>
    </form>
  );
}
