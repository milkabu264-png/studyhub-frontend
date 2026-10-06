function NotebookPage() {
  return (
    <div>
      <h1>Блокнот</h1>

      <section>
        <h2>Новая запись</h2>

        <form>
          <div>
            <label htmlFor="noteTitle">
              Заголовок
            </label>

            <input
              id="noteTitle"
              type="text"
              placeholder="Заголовок необязателен"
            />
          </div>

          <div>
            <label htmlFor="noteText">
              Текст
            </label>

            <textarea
              id="noteText"
              maxLength={5000}
              placeholder="Введите текст заметки"
            />
          </div>

          <button type="submit">
            Сохранить
          </button>
        </form>
      </section>

      <section>
        <h2>Мои записи</h2>

        <p>Здесь пока пусто</p>
      </section>
    </div>
  );
}

export default NotebookPage;