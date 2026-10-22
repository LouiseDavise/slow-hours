// Everything the owner can change in owner mode ("light editing"), with the demo defaults.
// Text visitors read is stored per language; the owner edits the language they're viewing.
import type { Localized } from './i18n/strings'

export type MenuSection = 'coffee' | 'notCoffee' | 'tea' | 'bites'
export const MENU_SECTIONS: MenuSection[] = ['coffee', 'notCoffee', 'tea', 'bites']

export type Tag = 'signature' | 'new' | 'seasonal'

export interface MenuItem {
  id: string
  section: MenuSection
  name: Localized
  note: Localized
  /** Hot (or the only) price in ringgit; null when it only comes iced. */
  price: number | null
  /** Iced price; null when there's no iced version. */
  iced: number | null
  soldOut: boolean
  tag?: Tag
}

export interface Cake {
  id: string
  name: Localized
  note: Localized
  /** Per slice; null for whole-cake-only. */
  slice: number | null
  /** Whole 8-inch cake; null when it isn't sold whole. */
  whole: number | null
  photo: string
  soldOut: boolean
  tag?: Tag
}

/** A single origin on The Hourly rotation. */
export interface Bean {
  id: string
  /** Farm or region, the same in both languages. */
  name: string
  origin: Localized
  process: Localized
  notes: Localized
  method: string
}

/** 0 = slow (quiet) … 3 = packed. */
export type CrowdLevel = 0 | 1 | 2 | 3

/** 0 = Sunday … 6 = Saturday; null = closed. Times are 24h "HH:MM". */
export type OpeningHours = Record<number, [string, string] | null>

export interface SiteContent {
  notice: { on: boolean; text: Localized }
  headline: Localized
  lead: Localized
  heroPhoto: string
  hours: OpeningHours
  /** Ringgit per cup of The Hourly. */
  hourlyPrice: number
  beans: Bean[]
  /** Hour of the day (0–23) → bean id. */
  hourly: Record<number, string>
  /** How full the cafe usually is, per hour (index 0–23). Weekend = Saturday and Sunday. */
  crowd: { weekday: CrowdLevel[]; weekend: CrowdLevel[] }
  menu: MenuItem[]
  cakes: Cake[]
  /** ISO time of the owner's last save, shown in the footer. */
  updatedAt: string | null
}

/** The localized top-level fields owner mode edits with `updateText`. */
export type TextKey = 'headline' | 'lead'

const same = (text: string): Localized => ({ en: text, ms: text })

const item = (id: string, section: MenuSection, name: Localized, note: Localized, price: number | null, iced: number | null, tag?: Tag): MenuItem =>
  ({ id, section, name, note, price, iced, soldOut: false, tag })

/** Levels for each hour from 0:00 to 23:00; hours outside opening times are ignored. */
const day = (levels: Record<number, CrowdLevel>): CrowdLevel[] => Array.from({ length: 24 }, (_, hour) => levels[hour] ?? 0)

export const DEFAULT_CONTENT: SiteContent = {
  notice: {
    on: true,
    text: {
      en: 'New this month: Yuzu Meringue Tart. And Ranau, Sabah is back on The Hourly.',
      ms: 'Baharu bulan ini: Tart Meringue Yuzu. Ranau, Sabah kembali dalam The Hourly.',
    },
  },
  headline: { en: 'Coffee by the hour. Cake all day.', ms: 'Kopi ikut jam. Kek sepanjang hari.' },
  lead: {
    en: 'A quiet corner of TTDI for slow mornings and long afternoons. Every hour, a different single-origin pour-over. Every morning, cakes from our own oven.',
    ms: 'Sudut tenang di TTDI untuk pagi yang santai dan petang yang panjang. Setiap jam, kopi tuang single-origin yang berbeza. Setiap pagi, kek dari ketuhar kami sendiri.',
  },
  heroPhoto: '/images/hero.jpg',
  hours: {
    0: ['09:00', '21:00'],
    1: null,
    2: ['09:00', '22:00'],
    3: ['09:00', '22:00'],
    4: ['09:00', '22:00'],
    5: ['09:00', '23:00'],
    6: ['09:00', '23:00'],
  },
  hourlyPrice: 16,
  beans: [
    {
      id: 'ranau', name: 'Ranau, Sabah', origin: same('Malaysia'),
      process: { en: 'Honey process', ms: 'Proses madu' },
      notes: { en: 'Jackfruit, toffee, black tea', ms: 'Nangka, tofi, teh hitam' },
      method: 'V60',
    },
    {
      id: 'guji', name: 'Guji Hambela', origin: same('Ethiopia'),
      process: { en: 'Washed', ms: 'Proses basuh' },
      notes: { en: 'Jasmine, white peach, bergamot', ms: 'Melati, pic putih, bergamot' },
      method: 'Kalita Wave',
    },
    {
      id: 'huila', name: 'Huila', origin: same('Colombia'),
      process: { en: 'Natural', ms: 'Proses asli' },
      notes: { en: 'Red grape, cacao nib, panela', ms: 'Anggur merah, nib koko, gula panela' },
      method: 'Origami',
    },
    {
      id: 'gayo', name: 'Aceh Gayo', origin: same('Indonesia'),
      process: { en: 'Wet-hulled', ms: 'Giling basah' },
      notes: { en: 'Dark chocolate, cedar, brown sugar', ms: 'Coklat gelap, kayu cedar, gula perang' },
      method: 'Chemex',
    },
    {
      id: 'nyeri', name: 'Nyeri AA', origin: same('Kenya'),
      process: { en: 'Washed', ms: 'Proses basuh' },
      notes: { en: 'Blackcurrant, grapefruit, hibiscus', ms: 'Kismis hitam, limau gedang, bunga raya' },
      method: 'V60',
    },
    {
      id: 'cerrado', name: 'Cerrado', origin: same('Brazil'),
      process: { en: 'Natural', ms: 'Proses asli' },
      notes: { en: 'Hazelnut, milk chocolate, caramel', ms: 'Hazel, coklat susu, karamel' },
      method: 'AeroPress',
    },
  ],
  hourly: {
    8: 'cerrado', 9: 'ranau', 10: 'guji', 11: 'cerrado', 12: 'huila', 13: 'ranau', 14: 'nyeri', 15: 'guji',
    16: 'gayo', 17: 'ranau', 18: 'huila', 19: 'cerrado', 20: 'gayo', 21: 'nyeri', 22: 'ranau', 23: 'cerrado',
  },
  crowd: {
    weekday: day({ 9: 1, 10: 0, 11: 1, 12: 2, 13: 3, 14: 1, 15: 0, 16: 0, 17: 1, 18: 2, 19: 2, 20: 1, 21: 0, 22: 0 }),
    weekend: day({ 9: 1, 10: 2, 11: 3, 12: 3, 13: 3, 14: 2, 15: 1, 16: 2, 17: 2, 18: 2, 19: 1, 20: 1, 21: 0, 22: 0 }),
  },
  menu: [
    item('espresso', 'coffee', same('Espresso'), { en: 'A double shot of the house blend: cocoa, brown sugar, a little citrus.', ms: 'Dua syot campuran rumah: koko, gula perang, sedikit sitrus.' }, 8, null),
    item('long-black', 'coffee', same('Long Black'), { en: 'Espresso over hot water. Clean and bold.', ms: 'Espresso di atas air panas. Bersih dan pekat.' }, 10, 11),
    item('flat-white', 'coffee', same('Flat White'), { en: 'Silky milk, strong coffee, a small cup.', ms: 'Susu lembut, kopi pekat, cawan kecil.' }, 13, null),
    item('latte', 'coffee', same('Latte'), { en: 'Our everyday cup. Oat milk +RM 2.', ms: 'Cawan harian kami. Susu oat +RM 2.' }, 13, 14),
    item('spanish-latte', 'coffee', same('Spanish Latte'), { en: 'Sweetened with condensed milk. Our best seller.', ms: 'Dimaniskan dengan susu pekat. Paling laris.' }, 14, 15, 'signature'),
    item('gula-melaka-latte', 'coffee', { en: 'Gula Melaka Latte', ms: 'Latte Gula Melaka' }, { en: 'Melaka palm sugar, slow-cooked into a syrup in-house.', ms: 'Gula Melaka dimasak perlahan menjadi sirap di dapur kami.' }, 15, 16, 'signature'),
    item('pandan-latte', 'coffee', { en: 'Pandan Latte', ms: 'Latte Pandan' }, { en: 'Fresh pandan leaves blended into the milk.', ms: 'Daun pandan segar dikisar bersama susu.' }, 15, 16, 'new'),
    item('mocha', 'coffee', same('Mocha'), { en: '70% dark chocolate and a double shot.', ms: 'Coklat gelap 70% dan dua syot espresso.' }, 15, 16),
    item('dirty', 'coffee', same('Dirty'), { en: 'A hot double shot poured over cold milk. Drink it straight away.', ms: 'Dua syot panas dituang ke atas susu sejuk. Minum terus.' }, null, 14),
    item('cold-brew', 'coffee', { en: '18-Hour Cold Brew', ms: 'Cold Brew 18 Jam' }, { en: 'Steeped slowly for 18 hours. Smooth, chocolatey, low in acid.', ms: 'Direndam perlahan selama 18 jam. Lembut, rasa coklat, kurang masam.' }, null, 14, 'signature'),
    item('yuzu-coffee', 'coffee', { en: 'Yuzu Coffee Soda', ms: 'Soda Kopi Yuzu' }, { en: 'Espresso, yuzu and sparkling water.', ms: 'Espresso, yuzu dan air berkarbonat.' }, null, 16),
    item('hojicha', 'notCoffee', { en: 'Hojicha Latte', ms: 'Latte Hojicha' }, { en: 'Roasted Japanese green tea: toasty, nutty, gentle.', ms: 'Teh hijau Jepun yang dipanggang: wangi, berkacang, lembut.' }, 15, 16),
    item('matcha', 'notCoffee', { en: 'Uji Matcha Latte', ms: 'Latte Matcha Uji' }, { en: 'Ceremonial-grade matcha from Uji, whisked to order.', ms: 'Matcha gred upacara dari Uji, dipukul bila dipesan.' }, 16, 17),
    item('chocolate', 'notCoffee', { en: 'Dark Chocolate', ms: 'Coklat Gelap' }, { en: '70% dark chocolate with steamed milk.', ms: 'Coklat gelap 70% dengan susu panas.' }, 14, 15),
    item('lemongrass', 'notCoffee', { en: 'Lemongrass Honey', ms: 'Serai Madu' }, { en: 'Fresh serai, wild honey and lime.', ms: 'Serai segar, madu hutan dan limau nipis.' }, null, 12),
    item('earl-grey', 'tea', same('Earl Grey'), { en: 'A pot for one, or two.', ms: 'Seteko untuk seorang, atau berdua.' }, 12, null),
    item('chamomile', 'tea', same('Chamomile'), { en: 'Calm in a cup.', ms: 'Ketenangan dalam cawan.' }, 12, null),
    item('teh-tarik', 'tea', same('Teh Tarik'), { en: 'Pulled tea, the Malaysian way. Ask for less sweet.', ms: 'Teh tarik cara Malaysia. Boleh minta kurang manis.' }, 8, 9),
    item('lychee-oolong', 'tea', { en: 'Lychee Oolong', ms: 'Oolong Laici' }, { en: 'Cold-steeped oolong with lychee.', ms: 'Oolong rendaman sejuk dengan laici.' }, null, 13),
    item('croissant', 'bites', { en: 'Butter Croissant', ms: 'Croissant Mentega' }, { en: 'Baked every morning. Add kaya +RM 2.', ms: 'Dibakar setiap pagi. Tambah kaya +RM 2.' }, 9, null),
    item('kaya-toast', 'bites', { en: 'Kaya Butter Toast', ms: 'Roti Bakar Kaya' }, { en: 'Thick-cut toast, pandan kaya, cold butter.', ms: 'Roti tebal, kaya pandan, mentega sejuk.' }, 10, null),
    item('banana-bread', 'bites', { en: 'Brown Butter Banana Bread', ms: 'Kek Pisang Mentega Perang' }, { en: 'A thick slice, toasted, with salted butter.', ms: 'Sepotong tebal, dibakar, dengan mentega masin.' }, 10, null),
    item('egg-mayo', 'bites', { en: 'Truffle Egg Mayo Croissant', ms: 'Croissant Telur Mayo Truffle' }, { en: 'Soft egg mayo, truffle oil, chives.', ms: 'Telur mayo lembut, minyak truffle, daun kucai.' }, 18, null),
    item('chicken-sourdough', 'bites', { en: 'Smoked Chicken Sourdough', ms: 'Sourdough Ayam Salai' }, { en: 'Smoked chicken, pickled onion, rocket, mustard mayo.', ms: 'Ayam salai, bawang jeruk, roket, mayo mustard.' }, 22, null),
  ],
  cakes: [
    {
      id: 'gula-melaka', name: { en: 'Gula Melaka Coffee Cake', ms: 'Kek Kopi Gula Melaka' },
      note: { en: 'Our signature. Espresso sponge, gula melaka cream, a dusting of cocoa.', ms: 'Kek istimewa kami. Span espresso, krim gula Melaka, taburan koko.' },
      slice: 16, whole: 148, photo: '/images/cake-gula-melaka.jpg', soldOut: false, tag: 'signature',
    },
    {
      id: 'cheesecake', name: { en: 'Vanilla Bean Cheesecake', ms: 'Kek Keju Vanila' },
      note: { en: 'Baked low and slow. Creamy, never too sweet.', ms: 'Dibakar perlahan. Lembut berkrim, tidak terlalu manis.' },
      slice: 15, whole: 128, photo: '/images/cake-cheesecake.jpg', soldOut: false,
    },
    {
      id: 'tiramisu', name: same('Tiramisu'),
      note: { en: 'Espresso-soaked sponge fingers and mascarpone. No alcohol.', ms: 'Biskut span direndam espresso dan mascarpone. Tanpa alkohol.' },
      slice: 16, whole: 140, photo: '/images/cake-tiramisu.jpg', soldOut: false,
    },
    {
      id: 'black-forest', name: same('Black Forest'),
      note: { en: 'Dark chocolate sponge, sour cherries, fresh cream. No alcohol.', ms: 'Span coklat gelap, ceri masam, krim segar. Tanpa alkohol.' },
      slice: 16, whole: 148, photo: '/images/cake-black-forest.jpg', soldOut: false,
    },
    {
      id: 'fraisier', name: { en: 'Strawberry Fraisier', ms: 'Fraisier Strawberi' },
      note: { en: 'Cameron Highlands strawberries, vanilla cream, light sponge.', ms: 'Strawberi Cameron Highlands, krim vanila, span ringan.' },
      slice: 17, whole: 158, photo: '/images/cake-fraisier.jpg', soldOut: false, tag: 'seasonal',
    },
    {
      id: 'yuzu-tart', name: { en: 'Yuzu Meringue Tart', ms: 'Tart Meringue Yuzu' },
      note: { en: 'Sharp yuzu curd under torched meringue.', ms: 'Kurd yuzu yang segar di bawah meringue yang dibakar.' },
      slice: 14, whole: 118, photo: '/images/cake-yuzu-tart.jpg', soldOut: false, tag: 'new',
    },
    {
      id: 'brownie', name: { en: 'Sea Salt Brownie', ms: 'Brownie Garam Laut' },
      note: { en: 'Fudgy, 70% dark chocolate, a pinch of sea salt.', ms: 'Lembap, coklat gelap 70%, secubit garam laut.' },
      slice: 9, whole: null, photo: '/images/cake-brownie.jpg', soldOut: false,
    },
    {
      id: 'fudge', name: { en: 'Chocolate Fudge Cake', ms: 'Kek Coklat Fudge' },
      note: { en: 'Whole cakes only. Three layers and a ganache drip: the birthday favourite.', ms: 'Kek penuh sahaja. Tiga lapis dengan titisan ganache: pilihan hari jadi.' },
      slice: null, whole: 158, photo: '/images/cake-fudge.jpg', soldOut: false,
    },
  ],
  updatedAt: null,
}

/** Saved edits on top of the defaults (matched by id), so items added later still show up. */
export function mergeContent(saved: Partial<SiteContent>): SiteContent {
  const byId = <T extends { id: string }>(defaults: T[], edits?: T[]) =>
    defaults.map((entry) => ({ ...entry, ...edits?.find((edit) => edit.id === entry.id) }))
  return {
    ...DEFAULT_CONTENT,
    ...saved,
    notice: { ...DEFAULT_CONTENT.notice, ...saved.notice },
    beans: byId(DEFAULT_CONTENT.beans, saved.beans),
    hourly: { ...DEFAULT_CONTENT.hourly, ...saved.hourly },
    crowd: { ...DEFAULT_CONTENT.crowd, ...saved.crowd },
    menu: byId(DEFAULT_CONTENT.menu, saved.menu),
    cakes: byId(DEFAULT_CONTENT.cakes, saved.cakes),
  }
}
