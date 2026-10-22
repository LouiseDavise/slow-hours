# Slow Hours

Demo website for a fictional aesthetic cafe in Taman Tun Dr Ismail (TTDI), Kuala Lumpur, built by STOEDIO as a portfolio piece for the **Business** package. It is built the way it would be for a real client: a brown, black and white brand, a coffee that changes every hour ("The Hourly"), a cake counter with whole-cake orders, table reservations over WhatsApp, and an owner who updates the menu, prices, hours and photos themselves.

React + Vite + TypeScript, in English (default) and Bahasa Melayu. Planned for **slowhours.stoedio.com**.

## Why Business

| Business includes | How Slow Hours uses it |
| --- | --- |
| 4–6 pages | 6: Home, Menu, Cakes, The Space, Reserve, Visit |
| Menu / service gallery | Cake gallery with photos, a menu board, and a photo gallery of the space with a lightbox |
| Contact form | Visit page: name, email, topic, message |
| Light editing | Owner mode (see below): menu, prices, sold out, cakes and photos, The Hourly rotation, crowd guide, opening hours, notice, headline |
| Everything in Starter | WhatsApp button, Google Maps, basic SEO, mobile-first, custom domain |
| Add-on: Booking via WhatsApp | Table reservations and whole-cake orders; the request arrives in the cafe's WhatsApp |
| Add-on: Instagram feed | The six-photo strip on the home page |

As a quote (prices from `src/config/site.ts` in the STOEDIO repo): Business Rp 1.000.000 + Booking via WhatsApp Rp 200.000 + Instagram feed Rp 100.000 = **Rp 1.300.000**, plus **Care Rp 100.000/month** (neither add-on needs a server).

Deliberately left out, because they are what would move a cafe to Business+: ordering ahead with a payment gateway (QRIS), a beans or merch shop with stock, staff accounts, and sales reports. Most cafes already run stock and sales in their POS.

## Pages

| Route | Contents |
| --- | --- |
| `/` | Hero with live "open now" and the coffee pouring this hour, The Hourly, signature cakes, the slow-hours meter, founders' story, Instagram feed, visit band |
| `/menu` | The Hourly (live card, today's pours hour by hour, the six beans), then Coffee, Not coffee, Tea, Bites and Cakes with hot/iced prices, delivery links |
| `/cakes` | Eight cakes with slice and whole prices, then the whole-cake order form (cake, pick-up date and time, message on the plaque, candles) |
| `/space` | Four house principles, the slow-hours meter with Today / Weekdays / Weekends, gallery with lightbox, amenities |
| `/reserve` | Table request: date, time, guests, seating area, occasion, contact |
| `/visit` | Address, getting there (MRT, car, Grab), opening hours, contact, map, delivery, contact form, FAQ |

## The Hourly

Every hour on the hour the bar switches to a different single-origin pour-over. The rotation is in `src/content.ts` (`beans` and `hourly`: hour of the day → bean id); the logic is in `src/lib/hourly.ts`.

- A pour runs from hh:00 to hh:59, for every full hour from opening until the last hour that starts before closing.
- The home page and menu show what's pouring now, how far into the hour it is, and the next pour with a countdown. The menu board dims past pours and marks the current one.
- On a closed day (Monday) the site shows when the bar opens next and that day's first pour.
- All times are Malaysia time (UTC+8), whatever the visitor's device is set to.

## Slow-hours meter

How busy the cafe usually is, per hour, on a scale of slow, easy, busy and packed. Weekdays and weekends have their own pattern (`crowd` in `src/content.ts`). The meter picks out the longest run of the quietest hours ("Slowest today: 3pm – 5pm") and shows "Right now" while the cafe is open. The logic is in `src/lib/crowd.ts`.

## Owner mode (light editing)

Tap **✎ Owner mode** (bottom left), or open any URL with `?owner`. Fields with an orange dashed outline can be edited:

- Notice strip (text, show or hide), headline, intro and hero photo
- Menu: names, descriptions, hot and iced prices, "sold out today"
- Cakes: names, descriptions, slice and whole prices, photos, "sold out"
- The Hourly: the coffee for each hour, tasting notes, price per cup
- Slow-hours meter: tap a bar to change how busy that hour usually is
- Opening hours (Visit page), per day, with a closed toggle

Owner mode edits the language on screen; prices, hours and photos are shared by both languages. **Save** publishes; **Cancel** discards.

In this demo, changes are saved in the visitor's browser (`localStorage`, key `sh-content-v1`). **Reset demo content** in the footer restores the defaults. A real client build would need a shared content store and an owner login.

## WhatsApp forms

Both forms build a WhatsApp message in the visitor's language.

- **Reservations** (`/reserve`): rules in `src/config.ts` (`reservationRules`): slots every 30 minutes, last table an hour before closing, same-day requests need an hour's notice, up to 30 days ahead, 1 to 10 guests.
- **Whole cakes** (`/cakes#order`): `cakeOrderRules`: at least 2 days ahead, pick-up from opening until 30 minutes before closing, a 30-character plaque message.

With `demo: true` the buttons preview the message instead of opening WhatsApp, with an option to send it to STOEDIO. The contact form on the Visit page only confirms in the demo; a live site would send it to the cafe's inbox through a form service.

## Languages

English by default; the **EN | BM** switch in the header changes it, and the choice is remembered (`localStorage`, key `sh-lang`). `?lang=ms` or `?lang=en` in a URL sets it directly. Interface text is in `src/i18n/strings.ts` (`en` and `ms` must have the same shape; TypeScript checks it). Malay times are written the Malaysian way ("9.30 pagi", "10 malam").

## Handy URL parameters

| Parameter | Effect |
| --- | --- |
| `?owner` | Opens owner mode straight away |
| `?lang=ms` | Bahasa Melayu |
| `?at=2026-10-24T15:20` | Starts the site's clock at that Malaysia time, e.g. `?at=2026-10-26T11:00` for a closed Monday |

They combine: `/menu?owner&lang=ms&at=2026-10-24T15:20`.

## Configuration

`src/config.ts`: business details, delivery links and form rules. For a real cafe: set `demo: false`, fill in `whatsapp`, point `delivery` at the cafe's GrabFood and foodpanda stores, connect the contact form to a form service and the Instagram strip to the cafe's account.

`src/content.ts`: everything the owner can change, with the demo defaults. `src/catalog.ts`: the fixed gallery and Instagram photos.

`index.html` and `public/robots.txt` keep the fictional business out of search engines.

## Develop and deploy

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run lint
```

Vercel: `vercel.json` builds with `npm run build`, serves `dist/` and rewrites every path to the app. For **slowhours.stoedio.com**, add the domain to the Vercel project and a CNAME `slowhours` → `cname.vercel-dns.com`.

## Photos

Photos in `public/images` are from [Unsplash](https://unsplash.com) (free to use under the Unsplash License), downloaded from `images.unsplash.com/photo-<id>`:

| File | Unsplash id |
| --- | --- |
| `hero.jpg` | 1497515114629-f71d768fd07c |
| `hourly.jpg` | 1442512595331-e89e73853f31 |
| `iced-latte.jpg` | 1517701604599-bb29b565090c |
| `latte-pour.jpg` | 1541167760496-1628856ab772 |
| `lattes.jpg` | 1507133750040-4a8f57021571 |
| `cheers.jpg` | 1495474472287-4d71bcdd2085 |
| `espresso-bar.jpg` | 1497935586351-b67a49e012bf |
| `window-seat.jpg` | 1445116572660-236099ec97a0 |
| `interior.jpg` | 1554118811-1e0d58224f24 |
| `bar.jpg` | 1453614512568-c4024d13c247 |
| `tables.jpg` | 1521017432531-fbd92d768814 |
| `laptop.jpg` | 1513530534585-c7b1394c6d51 |
| `greenery.jpg` | 1600093463592-8e36ae95ef56 |
| `little-things.jpg` | 1501747315-124a0eaca060 |
| `croissant.jpg` | 1555507036-ab1f4038808a |
| `cake-gula-melaka.jpg` | 1571115177098-24ec42ed204d |
| `cake-cheesecake.jpg` | 1524351199678-941a58a3df50 |
| `cake-tiramisu.jpg` | 1571877227200-a0d98ea607e9 |
| `cake-brownie.jpg` | 1606313564200-e75d5e30476c |
| `cake-black-forest.jpg` | 1606890737304-57a1ca8a5b62 |
| `cake-fraisier.jpg` | 1611293388250-580b08c4a145 |
| `cake-yuzu-tart.jpg` | 1519915028121-7d3463d20b13 |
| `cake-fudge.jpg` | 1578985545062-69928b1d9587 |
| `cake-celebration.jpg` | 1586985289688-ca3cf47d3e6e |
