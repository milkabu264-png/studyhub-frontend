function SettingsPage() {
  return (
    <div>
      <h1>Настройки</h1>

      <section>
        <h2>Аккаунт</h2>

        <form>
          <div>
            <label htmlFor="userName">
              Имя
            </label>

            <input
              id="userName"
              type="text"
            />
          </div>

          <div>
            <label htmlFor="email">
              E-mail
            </label>

            <input
              id="email"
              type="email"
            />
          </div>

          <button type="submit">
            Сохранить
          </button>
        </form>
      </section>

      <section>
        <h2>Настройки костра</h2>

        <div>
          <label htmlFor="lowFire">
            Горит слабо
          </label>

          <input
            id="lowFire"
            type="number"
            min="1"
            defaultValue="1"
          />
        </div>

        <div>
          <label htmlFor="normalFire">
            Горит
          </label>

          <input
            id="normalFire"
            type="number"
            min="1"
            defaultValue="3"
          />
        </div>

        <div>
          <label htmlFor="blazingFire">
            Пылает
          </label>

          <input
            id="blazingFire"
            type="number"
            min="1"
            defaultValue="5"
          />
        </div>

        <button type="button">
          Сохранить
        </button>

        <button type="button">
          Сбросить по умолчанию
        </button>
      </section>

      <section>
        <h2>Аккаунт</h2>

        <button type="button">
          Выйти
        </button>

        <button type="button">
          Удалить аккаунт
        </button>
      </section>
    </div>
  );
}

export default SettingsPage;