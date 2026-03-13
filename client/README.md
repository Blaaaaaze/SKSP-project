# Marathon Training Frontend

Клиентское веб-приложение для планирования подготовки к марафону.

## Стек

- **React 19**
- **TypeScript**
- **Vite**
- **React Router**
- **TanStack Query**
- **React Hook Form + Zod**
- **Tailwind CSS**
- **date-fns**

## Запуск

### Локально

```bash
npm install
npm run dev
```

Приложение будет доступно на http://localhost:5173

Backend должен быть запущен на http://localhost:8080 (Vite проксирует `/api` на backend).

### Docker

```bash
docker compose build --no-cache client
docker compose up
```

Client будет доступен на http://localhost:3000. API-запросы идут через nginx proxy на server.

## Маршруты

- `/login` — вход
- `/register` — регистрация
- `/onboarding/goal` — создание цели (онбординг)
- `/dashboard` — главный экран с календарём
- `/calendar` — календарь тренировок
- `/training/:id` — детали тренировки
- `/statistics` — статистика
- `/notifications` — уведомления
- `/profile` — профиль

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| VITE_API_URL | URL API (по умолчанию — относительный путь для прокси) |
