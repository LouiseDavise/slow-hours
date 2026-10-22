import { Link, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { WhatsAppProvider } from './components/WhatsApp'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { OwnerProvider } from './owner/OwnerContext'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cakes from './pages/Cakes'
import Space from './pages/Space'
import Reserve from './pages/Reserve'
import Visit from './pages/Visit'

function NotFound() {
  const { t } = useLanguage()
  return (
    <section className="page-head wrap">
      <h1>{t.notFound.title}</h1>
      <p className="lead"><Link to="/">{t.notFound.back}</Link></p>
    </section>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <OwnerProvider>
        <WhatsAppProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="cakes" element={<Cakes />} />
              <Route path="space" element={<Space />} />
              <Route path="reserve" element={<Reserve />} />
              <Route path="visit" element={<Visit />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </WhatsAppProvider>
      </OwnerProvider>
    </LanguageProvider>
  )
}
