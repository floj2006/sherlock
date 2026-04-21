# SHERLOCK

Премиальный сайт барбершопа SHERLOCK в Мурино на `Next.js 16 + Tailwind CSS 4`.

Проект собран как digital-версия закрытого grooming-клуба:
- тёмный premium UI
- mobile-first запись
- one-page-first главная
- отдельная страница `/book`
- SEO-маршруты для услуг, мастеров и journal
- готовый handoff под `Sanity` и `YCLIENTS`

## Стек

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`
- `TypeScript`
- `Sanity` как headless CMS
- `YCLIENTS` как основной booking backend
- `GA4` и `Яндекс.Метрика`

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть `http://localhost:3000`.

## Env

Скопируйте `.env.example` в `.env.local` и заполните значения:

```bash
copy .env.example .env.local
```

Ключевые переменные:
- `NEXT_PUBLIC_SITE_URL` - домен продакшна
- `NEXT_PUBLIC_YCLIENTS_BOOKING_URL` - ссылка на онлайн-запись
- `NEXT_PUBLIC_GA_ID` - Google Analytics 4
- `NEXT_PUBLIC_YM_ID` - Яндекс.Метрика
- `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` - Sanity
- `YCLIENTS_COMPANY_ID` / `YCLIENTS_PARTNER_TOKEN` / `YCLIENTS_USER_TOKEN` - backend-интеграция с YCLIENTS

## Структура

```txt
src/
  app/                    маршруты, metadata, sitemap, robots, api
  components/
    analytics/            GA4 / Yandex hooks
    booking/              sticky CTA, drawer, booking flow
    layout/               header, footer, page intro
    sections/             контентные секции главной
    seo/                  JSON-LD helpers
    ui/                   контейнеры и базовые UI-компоненты
  lib/
    analytics.ts
    seo.ts
    site-data.ts          fallback-контент и brand copy
    yclients.ts
    sanity/
  schemas/                handoff под Sanity schema types
```

## Production Notes

### 1. Контент

Сейчас проект использует fallback-данные из `src/lib/site-data.ts`.

Для боевого запуска рекомендуется:
- вынести услуги, мастеров, кейсы, отзывы и статьи в `Sanity`
- оставить `site-data.ts` как резервный слой
- заменить демо-отзывы на реальные отзывы из `2GIS`, `YCLIENTS` или Telegram

### 2. YCLIENTS

В проекте уже есть:
- отдельная страница `/book`
- quick drawer для записи в 1-2 клика
- API route `src/app/api/yclients/route.ts`
- helper `src/lib/yclients.ts`

Что стоит сделать перед продом:
- подставить реальный `NEXT_PUBLIC_YCLIENTS_BOOKING_URL`
- получить `company_id` и рабочие токены
- завести маппинг `service slug -> yclients service id`
- завести маппинг `master slug -> yclients staff id`
- при необходимости перевести preselect с URL-сценария на API/webhook слой

### 3. Analytics

События уже предусмотрены через `data-analytics-*` атрибуты:
- `book_click`
- `book_start`
- `call_click`
- `telegram_click`
- `map_click`

После подстановки `NEXT_PUBLIC_GA_ID` и `NEXT_PUBLIC_YM_ID` трекинг начинает работать без дополнительной сборки логики.

### 4. SEO

В проекте уже настроены:
- metadata через `createMetadata`
- `robots.ts`
- `sitemap.ts`
- `FAQPage`, `BreadcrumbList`, `LocalBusiness` JSON-LD
- динамические SEO-страницы услуг, мастеров и journal

## Проверка

```bash
npm run lint
npm run build
```

Обе команды должны проходить без ошибок.

## Следующий шаг

Если проект идёт в прод сразу, приоритет такой:
1. Подключить реальные business env.
2. Импортировать контент в `Sanity`.
3. Подставить реальные фото команды и подтверждённые отзывы.
4. Утвердить юридические тексты для `/privacy` и `/terms`.
5. Задеплоить на `Vercel`.
