import React from 'react'
import { ShoppingBag } from 'lucide-react'

interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
}



function getAmazonIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M13.96 12.2c0 .65-.02 1.19-.24 1.77-.18.47-.46.76-.98.76-.54 0-.86-.41-.86-.93 0-1.15 1.03-1.36 2.08-1.6zm2.03 3.6a.42.42 0 01-.48.05c-.67-.56-.79-.82-1.16-1.35-1.11 1.13-1.9 1.47-3.33 1.47-1.7 0-3.02-1.05-3.02-3.15 0-1.64.89-2.75 2.15-3.3 1.1-.48 2.63-.57 3.8-.7v-.27c0-.48.04-1.05-.25-1.47-.25-.37-.73-.53-1.15-.53-.78 0-1.48.4-1.65 1.24-.03.19-.17.37-.36.38l-2-.22c-.17-.04-.36-.17-.31-.42C8.72 5.38 10.57 4.8 12.22 4.8c.85 0 1.96.22 2.63.87.85.8.77 1.86.77 3.01v2.73c0 .82.34 1.18.66 1.63.11.16.14.35 0 .47-.36.3-1 .86-1.35 1.17l.06.12z"
        fill="#FF9900"
      />
      <path
        d="M18.14 18.93c-2.14 1.58-5.24 2.42-7.92 2.42-3.74 0-7.12-1.39-9.67-3.7-.2-.18-.02-.43.22-.29 2.76 1.6 6.16 2.57 9.68 2.57 2.37 0 4.98-.49 7.38-1.51.36-.16.67.24.31.51z"
        fill="#FF9900"
      />
      <path
        d="M19.05 17.93c-.28-.35-1.82-.17-2.51-.08-.21.03-.24-.16-.05-.29 1.23-.86 3.24-.61 3.48-.33.24.3-.06 2.34-1.22 3.32-.18.15-.35.07-.27-.13.26-.65.85-2.14.57-2.49z"
        fill="#FF9900"
      />
    </svg>
  )
}

function getGoogleIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21.35 11.1h-9.18v2.95h5.27c-.23 1.2-.92 2.22-1.96 2.9l3.17 2.46c1.85-1.7 2.92-4.22 2.92-7.12 0-.58-.05-1.14-.14-1.68l-.08.49z" fill="#4285F4"/>
      <path d="M12.17 21.5c2.65 0 4.88-.88 6.5-2.38l-3.17-2.46c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.73-5.5-4.06l-3.27 2.52c1.64 3.25 5.02 5.44 8.77 5.44z" fill="#34A853"/>
      <path d="M6.67 13.54a5.85 5.85 0 010-3.62L3.4 7.4a10.02 10.02 0 000 8.66l3.27-2.52z" fill="#FBBC05"/>
      <path d="M12.17 5.86c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.04 2.89 14.81 2 12.17 2 8.42 2 5.04 4.19 3.4 7.44l3.27 2.52c.77-2.33 2.94-4.1 5.5-4.1z" fill="#EA4335"/>
    </svg>
  )
}

function getShopeeIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C9.24 2 7 4.24 7 7v.5H5.5A1.5 1.5 0 004 9v11.5A1.5 1.5 0 005.5 22h13a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5H17V7c0-2.76-2.24-5-5-5zm0 1.5c1.93 0 3.5 1.57 3.5 3.5v.5h-7V7c0-1.93 1.57-3.5 3.5-3.5zm0 7.5c1.93 0 3.5 1.57 3.5 3.5S13.93 18 12 18s-3.5-1.57-3.5-3.5S10.07 11 12 11z"
        fill="#EE4D2D"
      />
    </svg>
  )
}

function getLazadaIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#0F146D" />
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
        L
      </text>
    </svg>
  )
}

function getTemuIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FB6F1E" />
      <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        Temu
      </text>
    </svg>
  )
}

function getAliExpressIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#E62E04" />
      <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Ali
      </text>
    </svg>
  )
}

function getDoorDashIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#FF3008" />
      <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        DD
      </text>
    </svg>
  )
}

function getAppleIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83z"
        fill="#333"
      />
      <path d="M15.5 3.5c.65-.83 1.09-1.98.97-3.13-1.05.05-2.22.72-2.94 1.56-.65.75-1.22 1.97-1.07 3.13 1.14.08 2.31-.61 3.04-1.56z" fill="#333" />
    </svg>
  )
}

function getEbayIcon(s: number) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <text x="2" y="16" fill="#E53238" fontSize="8" fontWeight="bold" fontFamily="sans-serif">e</text>
      <text x="7.5" y="16" fill="#0064D2" fontSize="8" fontWeight="bold" fontFamily="sans-serif">b</text>
      <text x="13" y="16" fill="#F5AF02" fontSize="8" fontWeight="bold" fontFamily="sans-serif">a</text>
      <text x="18.5" y="16" fill="#86B817" fontSize="8" fontWeight="bold" fontFamily="sans-serif">y</text>
    </svg>
  )
}

function getPlatformIcon(platform: string, size: number): React.ReactNode | null {
  const lower = platform.toLowerCase()

  if (lower.includes('amazon')) return getAmazonIcon(size)
  if (lower.includes('google')) return getGoogleIcon(size)
  if (lower.includes('shopee')) return getShopeeIcon(size)
  if (lower.includes('lazada')) return getLazadaIcon(size)
  if (lower.includes('temu')) return getTemuIcon(size)
  if (lower.includes('aliexpress') || lower.includes('ali express')) return getAliExpressIcon(size)
  if (lower.includes('doordash') || lower.includes('door dash')) return getDoorDashIcon(size)
  if (lower.includes('apple')) return getAppleIcon(size)
  if (lower.includes('ebay')) return getEbayIcon(size)

  return null
}

const BG_COLORS: Record<string, string> = {
  amazon: 'bg-amber-50 ring-amber-200',
  google: 'bg-blue-50 ring-blue-200',
  shopee: 'bg-orange-50 ring-orange-200',
  lazada: 'bg-indigo-50 ring-indigo-200',
  temu: 'bg-orange-50 ring-orange-200',
  aliexpress: 'bg-red-50 ring-red-200',
  doordash: 'bg-red-50 ring-red-200',
  apple: 'bg-slate-50 ring-slate-200',
  ebay: 'bg-slate-50 ring-slate-200',
}

function getBgClass(platform: string): string {
  const lower = platform.toLowerCase()
  for (const [key, cls] of Object.entries(BG_COLORS)) {
    if (lower.includes(key)) return cls
  }
  return 'bg-slate-100 ring-slate-200'
}

export function PlatformIcon({ platform, size = 20, className = '' }: PlatformIconProps) {
  const icon = getPlatformIcon(platform, size)

  return (
    <div
      className={`flex items-center justify-center rounded-xl ring-1 ${getBgClass(platform)} ${className}`}
      style={{ width: size + 20, height: size + 20 }}
      title={platform}
    >
      {icon ?? <ShoppingBag className="text-slate-400" style={{ width: size, height: size }} />}
    </div>
  )
}
