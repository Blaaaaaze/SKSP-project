# Database migrations

Миграции PostgreSQL для Marathon Training App.

- `000001_init_schema` — схема БД (users, goals, plans, sessions, exercises, results, notifications)
- `000002_seed_exercises` — начальные упражнения

Миграции применяются автоматически при старте server.
