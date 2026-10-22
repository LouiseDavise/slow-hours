import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { business, stoedio, waLink } from '../config'
import { useLanguage } from '../i18n/LanguageContext'
import Modal from './Modal'

/**
 * `openWhatsApp(message)` opens a chat with the cafe. In the demo there is no real cafe number,
 * so it previews the message instead and offers to send it to STOEDIO.
 */
const WhatsAppContext = createContext<(message: string) => void>(() => {})

export function useWhatsApp() {
  return useContext(WhatsAppContext)
}

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<string | null>(null)
  const open = useCallback((message: string) => {
    if (!business.demo && business.whatsapp) window.open(waLink(business.whatsapp, message), '_blank', 'noopener')
    else setPreview(message)
  }, [])

  return (
    <WhatsAppContext.Provider value={open}>
      {children}
      {preview && <WhatsAppPreview message={preview} onClose={() => setPreview(null)} />}
    </WhatsAppContext.Provider>
  )
}

function WhatsAppPreview({ message, onClose }: { message: string; onClose: () => void }) {
  const { t } = useLanguage()
  const w = t.whatsapp
  const tryLink = waLink(stoedio.whatsapp, `${w.toStoedio(business.name)}${message}`)
  return (
    <Modal label={w.dialog} onClose={onClose}>
      <p className="modal-eyebrow">{w.eyebrow}</p>
      <div className="wa-bubble">{message}</div>
      <p className="modal-note">{w.note}</p>
      <div className="modal-actions">
        <a className="btn btn-dark" href={tryLink} target="_blank" rel="noreferrer"><WhatsAppIcon />{w.tryStoedio}</a>
        <a className="btn btn-line" href={`${stoedio.url}/#contact`}>{w.wantSite}</a>
        <button type="button" className="btn btn-quiet" onClick={onClose}>{w.close}</button>
      </div>
    </Modal>
  )
}

export function WhatsAppIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  )
}
