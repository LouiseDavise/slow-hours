// Fixed photo sets (not owner-editable). Photos are from Unsplash; see README.
import type { Localized } from './i18n/strings'

export interface Photo {
  src: string
  caption: Localized
  /** Portrait photo: spans two rows in the gallery. */
  tall?: boolean
}

export const GALLERY: Photo[] = [
  { src: '/images/window-seat.jpg', caption: { en: 'The slow corner, by the window', ms: 'Sudut santai, di tepi tingkap' } },
  { src: '/images/iced-latte.jpg', caption: { en: 'Iced Spanish latte', ms: 'Spanish latte ais' }, tall: true },
  { src: '/images/bar.jpg', caption: { en: 'The bar', ms: 'Bar kami' } },
  { src: '/images/hourly.jpg', caption: { en: 'The Hourly, brewed by hand', ms: 'The Hourly, dibancuh dengan tangan' } },
  { src: '/images/interior.jpg', caption: { en: 'The main room', ms: 'Ruang utama' } },
  { src: '/images/lattes.jpg', caption: { en: 'Two flat whites', ms: 'Dua flat white' }, tall: true },
  { src: '/images/laptop.jpg', caption: { en: 'The window bar, weekdays', ms: 'Bar tingkap, hari biasa' } },
  { src: '/images/greenery.jpg', caption: { en: 'The patio', ms: 'Patio' } },
  { src: '/images/tables.jpg', caption: { en: 'The long table', ms: 'Meja panjang' } },
  { src: '/images/latte-pour.jpg', caption: { en: 'Latte art, every cup', ms: 'Seni latte, setiap cawan' } },
  { src: '/images/little-things.jpg', caption: { en: 'Enjoy the little things', ms: 'Nikmati perkara kecil' }, tall: true },
  { src: '/images/espresso-bar.jpg', caption: { en: 'Dialling in the house blend', ms: 'Menala campuran rumah' } },
]

/** The Instagram feed add-on pulls the latest posts on the live site; the demo shows a fixed set. */
export const INSTAGRAM: Photo[] = [
  { src: '/images/cheers.jpg', caption: { en: 'Saturday, 10am', ms: 'Sabtu, 10 pagi' } },
  { src: '/images/cake-tiramisu.jpg', caption: { en: 'Tiramisu, no alcohol', ms: 'Tiramisu, tanpa alkohol' } },
  { src: '/images/little-things.jpg', caption: { en: 'Slow hours', ms: 'Slow hours' } },
  { src: '/images/croissant.jpg', caption: { en: 'Out of the oven at 8:30am', ms: 'Keluar dari ketuhar 8.30 pagi' } },
  { src: '/images/iced-latte.jpg', caption: { en: 'Iced Spanish latte', ms: 'Spanish latte ais' } },
  { src: '/images/lattes.jpg', caption: { en: 'For two', ms: 'Untuk berdua' } },
]
