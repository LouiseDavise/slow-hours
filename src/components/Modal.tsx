import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/** Dialog with Escape to close, focus moved inside and the page behind kept still. */
export default function Modal({ label, onClose, children, className = '' }: {
  label: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  const card = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    card.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close.current() }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
      previous?.focus?.()
    }
  }, [])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className={`modal-card ${className}`} ref={card} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
