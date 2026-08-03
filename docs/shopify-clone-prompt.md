# Промпт: клониране на Shopify store в собствен код

Claude Code изгражда визуално идентично копие на съществуващ Shopify магазин,
но върху стек, който можеш да редактираш изцяло.

**Целеви магазин по подразбиране:** `https://cartely-2.myshopify.com`

---

## Как се пуска

1. Отвори нова, празна папка (или нов repo) в Claude Code.
2. Копирай **целия** файл [`prompts/shopify-clone-cartely.md`](prompts/shopify-clone-cartely.md)
   и го подай като първо съобщение.
3. Това е всичко. Промптът върви автономно през всичките 6 фази и завършва
   с работещ магазин, screenshots и попълнено `README.md`.

Не са нужни подготвителни стъпки. Промптът сам проверява дали магазинът е
достъпен и има вграден fallback, ако не е.

### По желание — по-точен резултат

- **Screenshot.** Full-page screenshot на началната страница, прикачен към
  промпта (Firefox: десен бутон → Take Screenshot → Save full page). Ако
  сайтът е заключен, това е най-бързият начин моделът да хване визията.
- **Ако магазинът е с парола.** Или махни паролата временно
  (Shopify admin → Online Store → Preferences), или подай
  `STORE_PASSWORD=...` като променлива — промптът я използва автоматично.
- **Storefront токен.** Shopify admin → Settings → Apps → Develop apps →
  Storefront API. Без него магазинът пак тръгва, но на данните от
  `capture/products.json` вместо на живо.

---

## Вариант A: без Shopify изобщо

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

## Вариант Б: остани в Shopify, но със собствена тема

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

## Кой вариант да избереш

| Ако… | Вземи |
|------|-------|
| Продаваш реално и искаш пълна свобода над front-end-а | Основния промпт (headless) |
| Дразни те само темата, Shopify ти върши работа | Собствена Shopify тема (Вариант Б) |
| Още не продаваш / не искаш абонамент | Standalone + Stripe (Вариант A) |
