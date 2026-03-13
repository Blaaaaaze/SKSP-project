# Marathon Training Server

API для системы планирования подготовки к марафону.

## Стек

- **Go 1.21**
- **Gin** — HTTP framework
- **pgx** — PostgreSQL driver
- **golang-migrate** — миграции БД
- **JWT** — аутентификация
- **zap** — логирование

## Запуск

### Локально (с PostgreSQL)

```bash
# Запуск PostgreSQL
docker run -d --name postgres -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=marathon -p 5432:5432 postgres:15

# Запуск server
cd server
MIGRATIONS_PATH=../database go run ./cmd/server
```

### Docker Compose

```bash
docker compose up
```

Backend будет доступен на http://localhost:8080

## API

### Аутентификация

- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход

### Защищённые эндпоинты (требуют заголовок `Authorization: Bearer <token>`)

- `POST /api/goals` — создать цель
- `POST /api/training-plan/generate` — сгенерировать план
- `GET /api/calendar` — календарь тренировок
- `GET /api/training/:id` — детали тренировки
- `POST /api/training/:id/start` — начать тренировку
- `POST /api/training/:id/complete` — завершить тренировку
- `GET /api/statistics` — статистика
- `GET /api/notifications` — уведомления

## Переменные окружения

Переменные задаются через `.env` в корне проекта (скопируйте `.env.example` в `.env`).
Docker Compose автоматически подставляет значения из `.env`.

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| DATABASE_URL | URL подключения к PostgreSQL | postgres://app:app@postgres:5432/marathon (Docker) / localhost (локально) |
| PORT | Порт сервера | 8080 |
| JWT_SECRET | Секрет для JWT | marathon-secret-change-in-production |
| MIGRATIONS_PATH | Путь к миграциям | ../database (локально) / /app/database (Docker) |
