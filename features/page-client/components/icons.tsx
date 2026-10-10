import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export const CheckIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const CopyIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" />
  </svg>
)

export const ExternalIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </svg>
)

export const EyeIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const EyeOffIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5C18 5.5 21.5 12 21.5 12a17 17 0 0 1-3.2 4M6.2 6.9C3.9 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

export const PlayIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M7 4.5v15l12.5-7.5L7 4.5Z" />
  </svg>
)

export const DownloadIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 19.5h15" />
  </svg>
)

export const ShieldIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.7 7 9 4.1-1.3 7-4.7 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
)

export const ClockIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const ScreenIcon = (p: P) => (
  <svg {...stroke} {...p}>
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M8.5 20h7M12 16.5V20" />
  </svg>
)

/** Cadenas dont l'anse s'ouvre quand `open` passe à vrai. */
export function LockIcon({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg viewBox="-4 -10 56 56" className={className} aria-hidden fill="none" overflow="visible">
      <g
        className={open ? 'animate-shackle' : undefined}
        style={{ transformOrigin: '15px 21px', transformBox: 'view-box' }}
      >
        <path d="M15 21v-6a9 9 0 0 1 18 0v6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </g>
      <rect x="9" y="21" width="30" height="22" rx="6" fill="currentColor" />
      <circle cx="24" cy="31" r="3" fill="var(--lock-hole, #fff)" />
      <path d="M24 33v4" stroke="var(--lock-hole, #fff)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
