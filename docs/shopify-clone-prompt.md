# Промпт: клониране на Shopify store в собствен код

Готов за копиране промпт, с който Claude Code изгражда пиксел-за-пиксел копие на
съществуващ Shopify магазин, но върху стек, който можеш да редактираш изцяло.

**Целеви магазин по подразбиране:** `https://cartely-2.myshopify.com`

---

## 0. Преди да пуснеш промпта — 3 неща

1. **Отвори магазина в браузър** и направи screenshot на цялата начална страница
   (Firefox: десен бутон → „Take Screenshot" → „Save full page"). Прикачи го към
   промпта — Claude вижда изображения и това е най-бързият начин да хване
   визията.
2. **Ако магазинът е password-protected**, махни паролата временно
   (Shopify admin → Online Store → Preferences → Disable password) или дай
   preview link. Иначе стъпка „Capture" във промпта ще върне 401/403.
3. **Реши стека** (виж секция „Вариант" долу). По подразбиране промптът е
   писан за **Next.js + Tailwind + Shopify Storefront API (headless)** — пазиш
   продуктите, поръчките и checkout-а в Shopify, но целият front-end е твой код.

---

## 1. Промптът (копирай оттук надолу)

````text
# ЗАДАЧА

Изгради пълно, визуално идентично копие на онлайн магазина
https://cartely-2.myshopify.com — но като собствен код, който мога да
редактирам без ограниченията на Shopify темите.

## Стек (задължителен)

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 за стилове
- Shopify Storefront API (GraphQL) за продукти, колекции и cart
- Shopify Checkout за плащането (redirect към `cart.checkoutUrl`)
- Без UI библиотека — само Tailwind + няколко собствени компонента
- Deploy target: Vercel

Ако някоя от тези зависимости е излишна за задачата, кажи защо преди да я
пропуснеш — не я махай мълчаливо.

## ФАЗА 1 — Capture (не пиши код преди да я завършиш)

Свали и анализирай оригинала. Изпълни точно тези стъпки и ми покажи резултата:

1. `curl -sL https://cartely-2.myshopify.com -o capture/index.html`
   и същото за: `/collections/all`, `/collections/all?page=2`,
   първите 3 продуктови страници, `/pages/about`, `/pages/contact`,
   `/cart`, `/search`.
2. `curl -sL https://cartely-2.myshopify.com/products.json?limit=250`
   → пълен списък с продукти: title, handle, body_html, product_type, tags,
   images, варианти и цени. Запази като `capture/products.json`.
3. `curl -sL https://cartely-2.myshopify.com/collections.json?limit=250`
   → `capture/collections.json`.
4. Свали всички CSS файлове, реферирани в `index.html`, в `capture/css/`.
5. Извлечи и запиши в `capture/DESIGN-TOKENS.md`:
   - точните HEX цветове (background, text, accent/CTA, borders, hover states)
   - font families, font sizes, weights, line-heights и letter-spacing
     за: h1, h2, h3, body, product title, price, button
   - spacing скала (padding/margin стойностите, които се повтарят)
   - border-radius стойности, shadow стойности
   - максимална ширина на контейнера и breakpoints
6. Запиши в `capture/SECTIONS.md` пълен инвентар на началната страница —
   всяка секция по ред, отгоре надолу, с точния текст (announcement bar,
   header/nav, hero, USP икони, featured collection, product grid,
   testimonials, newsletter, footer колони, payment icons). Дословен текст,
   не преразказ.
7. Ако имам прикачен screenshot — сверявай с него, той е източникът на истината
   за визията.

**Спри тук и ми покажи `DESIGN-TOKENS.md` и `SECTIONS.md` за одобрение.**

## ФАЗА 2 — Скеле

- `npx create-next-app@latest` с TypeScript, Tailwind, App Router, src/ dir
- `.env.local.example` с `SHOPIFY_STORE_DOMAIN` и
  `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `src/lib/shopify/` — typed GraphQL клиент: `getProducts`, `getProduct`,
  `getCollection`, `createCart`, `addToCart`, `updateCartLine`, `getCart`
- Всички design tokens от Фаза 1 → `src/app/globals.css` като CSS custom
  properties + Tailwind `@theme`. Никакви hardcoded цветове в компонентите.

## ФАЗА 3 — Компоненти и страници

Компоненти (един файл на компонент, `src/components/`):
AnnouncementBar, Header (с mobile drawer + search), Hero, USPStrip,
ProductCard, ProductGrid, CollectionFilters, ProductGallery,
VariantSelector, AddToCart, CartDrawer, Testimonials, NewsletterForm,
Footer.

Страници (App Router):
- `/` — начална, точно същите секции в същия ред като `SECTIONS.md`
- `/collections/[handle]` — с филтри и сортиране
- `/products/[handle]` — галерия, варианти, количество, add-to-cart, описание
- `/cart` — пълна количка + бутон към Shopify Checkout
- `/search` — резултати от Storefront API
- `/pages/[handle]` — статични страници от Shopify

## ФАЗА 4 — Довършване

- Responsive: провери 375px, 768px, 1440px
- Loading states (skeletons) и empty states за всяка листинг страница
- SEO: `generateMetadata` за всяка страница, OG tags, JSON-LD Product schema
- Accessibility: keyboard nav в drawer-ите, alt текстове, focus states,
  контраст мин. WCAG AA
- `next/image` за всички изображения, Shopify CDN домейнът в
  `next.config.ts` → `images.remotePatterns`
- `README.md`: setup, къде се сменя всеки цвят/шрифт/секция, как се добавя
  нова секция на началната страница

## ФАЗА 5 — Верификация (задължителна)

1. `npm run build` минава без грешки и без TypeScript warnings
2. Пусни dev сървъра, отвори с Playwright (Chromium е инсталиран,
   `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, не пускай
   `playwright install`) и направи screenshots на `/`, една collection и
   един продукт, на 375px и 1440px
3. Постави ги един до друг с оригинала и ми изброй **всяка** разлика, която
   виждаш — не твърди, че съвпада, преди да си сравнил визуално
4. Оправи разликите и повтори

## Правила

- Никакви placeholder текстове тип „Lorem ipsum" — всичко идва от
  `capture/`. Ако нещо липсва, питай, не си го измисляй.
- Никакви inline hex цветове — само tokens.
- Комитвай на логични стъпки, по една фаза на commit.
- Ако нещо в оригинала е обективно счупено или лоша практика (contrast,
  a11y, layout shift), направи го както трябва и ми кажи какво си променил
  и защо — не го клонирай сляпо.
````

---

## 2. Вариант: без Shopify изобщо

Ако не искаш да плащаш Shopify абонамент, смени в промпта секция **Стек**:

```text
- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Продуктите — локален `src/data/products.ts`, генериран от capture/products.json
- Cart — Zustand в localStorage
- Checkout — Stripe Checkout Session (`@stripe/stripe-js` + API route)
```

И махни всички `Storefront API` референции. Останалото стои непроменено.

**Компромисът:** губиш Shopify admin, inventory, поръчки и данъчните
настройки. Ако вече продаваш реално — остани на headless варианта.

---

## 3. Вариант: остани в Shopify, но със собствена тема

Ако проблемът е само темата, а не платформата — най-малкото усилие е
собствена Shopify тема, не headless:

```text
Изгради Shopify тема от нулата (Liquid + Tailwind, Online Store 2.0,
sections everywhere, JSON templates), която визуално повтаря
cartely-2.myshopify.com. Използвай Shopify CLI (`shopify theme dev`).
Всяка секция да има schema settings, за да мога да я редактирам от
theme editor без код.
```

Пазиш всичко от Shopify, получаваш пълен контрол над markup-а. По-малко
свобода от headless, но и десет пъти по-малко работа.

---

## 4. Кой вариант да избереш

| Ако… | Вземи |
|------|-------|
| Продаваш реално и искаш пълна свобода над front-end-а | Headless (основния промпт) |
| Дразни те само темата, Shopify ти върши работа | Собствена Shopify тема (§3) |
| Още не продаваш / не искаш абонамент | Standalone + Stripe (§2) |
