function StatisticsPage() {
  return (
    <div>
      <h1>Статистика</h1>

      <section>
        <label htmlFor="period">
          Период
        </label>

        <select
          id="period"
          defaultValue="week"
        >
          <option value="day">
            День
          </option>

          <option value="week">
            Неделя
          </option>

          <option value="month">
            Месяц
          </option>

          <option value="all">
            Всё время
          </option>
        </select>
      </section>

      <section>
        <h2>Общая статистика</h2>

        <p>Очки: 0</p>
        <p>Выполнено задач: 0</p>
        <p>Не выполнено задач: 0</p>
      </section>

      <section>
        <h2>По сложности</h2>

        <p>Лёгкие: 0</p>
        <p>Средние: 0</p>
        <p>Сложные: 0</p>
      </section>

      <section>
        <h2>Активность</h2>

        <p>
          Здесь позже будет график
        </p>
      </section>
    </div>
  );
}

export default StatisticsPage;