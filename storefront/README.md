# Cartely storefront

Магазин на Next.js 16 + Tailwind v4, който замества Shopify темата с код,
който можеш да редактираш изцяло. Shopify остава за продуктите, поръчките и
плащането — front-end-ът е твой.

## Пускане

```bash
npm install
npm run dev          # http://localhost:3000
```

Работи веднага, без токен и без конфигурация. Каталогът идва от
`src/lib/data/catalog.ts`.

## Включване на реалните данни от Shopify

```bash
cp .env.local.example .env.local
```

Попълни `SHOPIFY_STOREFRONT_ACCESS_TOKEN` и рестартирай. Това е всичко —
няма стъпка за импорт. Приложението засича токена и минава на живи
продукти, колекции, страници и истински Shopify Checkout. Ако заявката се
провали, пада обратно на локалния каталог, вместо да счупи страницата.

Токенът се взима от: Shopify admin → Settings → Apps and sales channels →
Develop apps → Create an app → Storefront API → Install. Нужни scope-ове:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts`

## Къде се сменя какво

| Искам да сменя… | Файл |
|---|---|
| Цвят, шрифт, радиус, ширина на контейнера | `src/app/globals.css` (`:root` блокът) |
| Всеки текст на сайта — меню, hero, бутони, футър | `src/content/site.ts` |
| Реда на секциите на началната страница | `homeSections` в `src/content/site.ts` |
| Продукти в демо режим | `src/lib/data/catalog.ts` |
| Логиката за данни (Shopify ↔ локално) | `src/lib/catalog.ts` |
| GraphQL заявките | `src/lib/shopify/queries.ts` |

**Нито един компонент не съдържа hardcoded цвят или текст.** Цветовете са
CSS custom properties, копито е в `site.ts`. Това е разликата спрямо
Shopify темата — сменяш палитрата на едно място и целият магазин я поема.

### Шрифтове

Playfair Display е самостоятелно хостван през `@fontsource` — няма заявка
към Google Fonts нито на build, нито при зареждане. Кирилицата е включена.
Смяна на шрифт: инсталираш друг `@fontsource` пакет, сменяш двата import-а
в `src/app/layout.tsx` и стойността на `--font-heading`.

### Добавяне на нова секция на началната страница

1. Направи компонента в `src/components/sections/`.
2. Добави текста му като обект в `src/content/site.ts`.
3. Добави името му в масива `homeSections`, на позицията, на която го искаш.
4. Закачи го в `sections` map-а в `src/app/page.tsx`.

Редът на страницата се чете от `homeSections`, не от JSX-а, така че
разместване = размяна на два реда в един масив.

## Структура

```
src/
  app/
    page.tsx                    начална страница
    collections/[handle]/       колекция с филтри и сортиране
    products/[handle]/          продукт с варианти и галерия
    cart/                       пълна количка
    search/                     търсене
    pages/[handle]/             статични страници
    actions/checkout.ts         server action → Shopify Checkout
  components/
    cart/                       CartProvider, CartDrawer
    collection/                 филтри и сортиране
    layout/                     Header, Footer
    product/                    ProductCard, Grid, Gallery, Purchase
    sections/                   секциите на началната страница
    ui/                         Button, Container, Icons
  content/site.ts               ЦЕЛИЯТ текст на сайта
  lib/
    catalog.ts                  Shopify ↔ локален каталог
    cart-store.ts               количка (localStorage)
    shopify/                    Storefront API клиент
    data/catalog.ts             демо каталог
```

## Скриптове

```bash
npm run dev          # dev сървър
npm run build        # production build
npm run start        # production сървър
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest, 41 unit теста
npm run test:watch   # vitest в watch режим
npm run images       # регенерира демо SVG изображенията
```

## Проверка

Два слоя. Unit тестовете покриват логиката (сортиране, търсене, колекции,
цени, количка):

```bash
npm test
```

End-to-end проверката кара реален браузър през магазина:

```bash
npm run build
npm run start -- --port 3100
node scripts/verify.mjs
```

Минава пътя начало → колекция → продукт → избор на вариант → add to cart →
количка → checkout, проверява пагинацията (включително страница извън
диапазона), формата за бюлетин с валиден и невалиден имейл, липсата на
хоризонтален скрол и на конзолни грешки, и снима всяка страница на 375px и
1440px в `verification/`.

CI (`.github/workflows/storefront.yml`) пуска lint, typecheck, тестовете и
build при всеки push, плюс проверка че генерираните изображения не са се
разминали с каталога.

## Deploy на Vercel

```bash
npx vercel
```

Добави `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN` и
`NEXT_PUBLIC_SITE_URL` в Environment Variables на проекта. Без тях
деплойът пак минава — просто ще е с демо каталога.

## Демо изображенията

`public/images/` съдържа генерирани SVG-та, за да няма външни зависимости.
Когато включиш Storefront API, снимките идват от `cdn.shopify.com` и тези
файлове стават ненужни.
