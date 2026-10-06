function HomePage() {
  return (
    <div>
      <h1>Главная</h1>

      <section>
        <button type="button">←</button>
        <span>Сегодня</span>
        <button type="button">→</button>
      </section>

      <section>
        <h2>Мои задачи</h2>

        <button type="button">
          Добавить задачу
        </button>

        <p>Задач пока нет</p>
      </section>

      <section>
        <h2>Костёр</h2>

        <div>
          🔥
        </div>

        <p>Брёвен сегодня: 0</p>
      </section>
    </div>
  );
}

export default HomePage;