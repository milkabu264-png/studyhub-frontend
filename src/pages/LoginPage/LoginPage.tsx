function LoginPage() {
  return (
    <div>
      <h1>Вход</h1>

      <form>
        <div>
          <label>
            <input
              type="radio"
              name="loginType"
              value="email"
              defaultChecked
            />
            E-mail
          </label>

          <label>
            <input
              type="radio"
              name="loginType"
              value="phone"
            />
            Телефон
          </label>
        </div>

        <div>
          <label htmlFor="login">
            E-mail или телефон
          </label>

          <input
            id="login"
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

        <button type="submit">
          Войти
        </button>
      </form>

      <p>
        Нет аккаунта? Зарегистрируйтесь
      </p>
    </div>
  );
}

export default LoginPage;