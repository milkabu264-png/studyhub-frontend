function RegisterPage() {
  return (
    <div>
      <h1>Регистрация</h1>

      <form>
        <div>
          <label htmlFor="name">
            Имя
          </label>

          <input
            id="name"
            type="text"
            placeholder="Введите имя"
          />
        </div>

        <div>
          <label>
            <input
              type="radio"
              name="registerType"
              value="email"
              defaultChecked
            />
            E-mail
          </label>

          <label>
            <input
              type="radio"
              name="registerType"
              value="phone"
            />
            Телефон
          </label>
        </div>

        <div>
          <label htmlFor="contact">
            E-mail или телефон
          </label>

          <input
            id="contact"
            type="text"
            placeholder="Введите e-mail или телефон"
          />
        </div>

        <div>
          <label htmlFor="password">
            Пароль
          </label>

          <input
            id="password"
            type="password"
            placeholder="Введите пароль"
          />
        </div>

        <div>
          <label htmlFor="repeatPassword">
            Повторите пароль
          </label>

          <input
            id="repeatPassword"
            type="password"
            placeholder="Повторите пароль"
          />
        </div>

        <button type="submit">
          Создать аккаунт
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;