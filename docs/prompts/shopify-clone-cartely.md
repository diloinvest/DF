# ЗАДАЧА

Изгради работещ онлайн магазин — визуално идентично копие на
`https://cartely-2.myshopify.com` — като собствен код, който мога да
редактирам изцяло, без ограниченията на Shopify темите.

Работи автономно докрай. Не спирай за потвърждение между фазите. Питай само
ако си блокиран и никое разумно допускане не върши работа. Ако допуснеш нещо
— напиши го в `DECISIONS.md` и продължи.

---

## Стек (задължителен)

- Next.js 15, App Router, TypeScript strict, `src/` директория
- Tailwind CSS v4
- Shopify Storefront API (GraphQL) за продукти, колекции, търсене и cart
- Shopify Checkout за плащане — redirect към `cart.checkoutUrl`
- Без UI библиотека — само Tailwind и собствени компоненти
- Deploy target: Vercel

Ако някоя зависимост се окаже излишна, махни я и напиши защо в `DECISIONS.md`.

---

## ФАЗА 0 — Preflight

1. `node --version` → изисква се 20+. Ако е по-старо, спри и кажи.
2. `curl -sS -o /dev/null -w "%{http_code}" https://cartely-2.myshopify.com`
   - `200` → продължи към Фаза 1 нормално.
   - `401` / редирект към `/password` → магазинът е заключен. Пробвай
     `curl -c jar.txt -d "form_type=storefront_password&password=$STORE_PASSWORD" https://cartely-2.myshopify.com/password`
     ако е зададена променлива `STORE_PASSWORD`. Ако не е — **не спирай
     задачата**: мини на Фаза 1-Б (fallback).
   - `403` / мрежова грешка → средата блокира домейна. Мини на Фаза 1-Б.
3. Създай `capture/` и `DECISIONS.md` в корена.

---

## ФАЗА 1 — Capture (реални данни)

Свали оригинала и извлечи от него истината за дизайна:

1. HTML на: `/`, `/collections/all`, `/collections/all?page=2`, първите 3
   продуктови страници, `/pages/about`, `/pages/contact`, `/cart`, `/search`
   → `capture/html/`
2. `https://cartely-2.myshopify.com/products.json?limit=250`
   → `capture/products.json` (title, handle, body_html, product_type, tags,
   images, варианти, цени)
3. `https://cartely-2.myshopify.com/collections.json?limit=250`
   → `capture/collections.json`
4. Всички CSS файлове от `<link>` таговете → `capture/css/`
5. `capture/DESIGN-TOKENS.md`:
   - точни HEX стойности: background, surface, text primary/secondary,
     accent/CTA, border, hover и active състояния
   - font families, sizes, weights, line-height, letter-spacing за
     h1, h2, h3, body, product title, price, button, nav link
   - повтарящата се spacing скала
   - border-radius, box-shadow
   - max-width на контейнера и точните breakpoints
6. `capture/SECTIONS.md` — инвентар на началната страница, секция по секция
   отгоре надолу, с **дословния** текст: announcement bar, header/nav, hero,
   USP икони, featured collection, product grid, testimonials, newsletter,
   footer колони, payment icons. Не преразказвай.

### ФАЗА 1-Б — Fallback, ако сайтът е недостъпен

Не спирай и не питай. Направи следното:

1. Провери за прикачени screenshots или файлове в `capture/` — ако има,
   те стават източникът на истината. Извлечи tokens и секции от тях.
2. Ако няма нищо: изгради магазина по **`capture/DESIGN-TOKENS.md`
   по подразбиране** (виж Приложение А долу) и генерирай 12 демо продукта
   в `capture/products.json` със същата структура като Shopify връща.
3. Напиши най-отгоре в `README.md` секция **„Как да заредиш реалните данни"**
   с точните команди от Фаза 1 — за да мине магазинът на истинско съдържание
   с едно пускане, когато домейнът стане достъпен.
4. Отбележи ясно в `DECISIONS.md`, че визията е по default tokens, а не по
   оригинала.

---

## ФАЗА 2 — Скеле

- `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint`
- `.env.local.example`:
  ```
  SHOPIFY_STORE_DOMAIN=cartely-2.myshopify.com
  SHOPIFY_STOREFRONT_ACCESS_TOKEN=
  ```
- Ако липсва токен, приложението да тръгва на данните от
  `capture/products.json` през `src/lib/data/local.ts` — магазинът трябва да
  се вижда работещ и без токен.
- `src/lib/shopify/` — typed GraphQL клиент: `getProducts`, `getProduct`,
  `getCollection`, `searchProducts`, `createCart`, `addToCart`,
  `updateCartLine`, `removeCartLine`, `getCart`
- Всички tokens от Фаза 1 → `src/app/globals.css` като CSS custom properties
  + Tailwind `@theme`. **Никакъв hardcoded цвят в компонент.**

---

## ФАЗА 3 — Компоненти и страници

Компоненти, по един файл всеки, в `src/components/`:
`AnnouncementBar`, `Header` (mobile drawer + search), `Hero`, `USPStrip`,
`ProductCard`, `ProductGrid`, `CollectionFilters`, `ProductGallery`,
`VariantSelector`, `QuantityInput`, `AddToCart`, `CartDrawer`,
`Testimonials`, `NewsletterForm`, `Footer`.

Страници (App Router):

| Път | Съдържание |
|-----|-----------|
| `/` | Същите секции, в същия ред като `SECTIONS.md` |
| `/collections/[handle]` | Грид с филтри и сортиране |
| `/products/[handle]` | Галерия, варианти, количество, add-to-cart, описание |
| `/cart` | Пълна количка + бутон към Shopify Checkout |
| `/search` | Резултати от Storefront API |
| `/pages/[handle]` | Статични страници |
| `not-found.tsx` | 404 в стила на магазина |

---

## ФАЗА 4 — Довършване

- Responsive проверка на 375, 768 и 1440px
- Loading skeletons и empty states за всеки листинг
- `generateMetadata` на всяка страница, OG tags, JSON-LD Product schema
- Accessibility: keyboard nav в drawer-ите, alt текстове, видими focus
  states, контраст минимум WCAG AA
- `next/image` навсякъде; `cdn.shopify.com` в `next.config.ts` →
  `images.remotePatterns`
- `.env.local.example`, `.gitignore`, `README.md`

`README.md` да съдържа: setup за 3 команди, къде се сменя всеки цвят, шрифт и
секция, как се добавя нова секция на началната страница, как се пуска deploy
на Vercel.

---

## ФАЗА 5 — Верификация (задължителна, без прескачане)

1. `npm run build` минава — нула грешки, нула TypeScript warnings
2. `npx tsc --noEmit` минава
3. `npm run lint` минава
4. Пусни dev сървъра и го отвори с Playwright. Chromium вече е инсталиран
   (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`) — **не пускай
   `playwright install`**. Screenshots на `/`, една колекция и един продукт,
   на 375px и 1440px → `verification/`
5. Ако имаш capture от оригинала: сложи ги един до друг и изброй **всяка**
   разлика. Не пиши „съвпада", преди да си сравнил визуално. Оправи и повтори.
6. Кликни през целия път ръчно с Playwright: начало → колекция → продукт →
   избор на вариант → add to cart → отваряне на количката → бутон checkout.
   Всяка стъпка да работи.

---

## Definition of done

- [ ] `npm run build`, `tsc --noEmit` и `lint` минават чисти
- [ ] Всички 7 маршрута се зареждат без грешка в конзолата
- [ ] Пътят до checkout работи end-to-end
- [ ] Нула hardcoded цветове извън `globals.css`
- [ ] Нула placeholder текстове от типа „Lorem ipsum"
- [ ] Screenshots в `verification/` на двата размера
- [ ] `README.md` и `DECISIONS.md` са попълнени
- [ ] Всичко е комитнато, по един commit на фаза

---

## Правила

- Никакви измислени текстове. Всичко идва от `capture/`. Липсва ли нещо —
  вземи го от default tokens и го отбележи, не си го измисляй мълчаливо.
- Никакви inline hex цветове — само tokens.
- Commit на всяка завършена фаза, със смислено съобщение.
- Ако нещо в оригинала е обективно счупено (контраст, a11y, layout shift),
  направи го както трябва и запиши в `DECISIONS.md` какво и защо си сменил.
  Не клонирай грешки сляпо.
- Накрая ми дай кратко резюме: какво е готово, какво е допуснато, какво
  остава.

---

## Приложение А — Default design tokens (само за Фаза 1-Б)

Чиста, неутрална e-commerce база. Използвай я само ако оригиналът е
недостъпен и няма прикачени screenshots.

```css
--color-bg:          #ffffff;
--color-surface:     #f6f6f4;
--color-text:        #1a1a1a;
--color-text-muted:  #6b6b6b;
--color-accent:      #1a1a1a;
--color-accent-text: #ffffff;
--color-border:      #e5e5e2;
--color-sale:        #b23b3b;

--font-heading: "Inter", system-ui, sans-serif;
--font-body:    "Inter", system-ui, sans-serif;

--text-h1: 2.5rem/1.1;   --weight-h1: 600;
--text-h2: 1.75rem/1.2;  --weight-h2: 600;
--text-h3: 1.25rem/1.3;  --weight-h3: 500;
--text-body: 1rem/1.6;   --weight-body: 400;

--space: 0.25rem;          /* скала: 2, 3, 4, 6, 8, 12, 16, 24 */
--radius: 0.375rem;
--shadow-card: 0 1px 3px rgb(0 0 0 / 0.08);
--container: 1280px;
```

Breakpoints: 640 / 768 / 1024 / 1280px.
