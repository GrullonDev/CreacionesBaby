import { formatCurrency } from './currency'

const REFERRAL_KEY = 'creaciones_referral'
const REFERRAL_CREDIT_KEY = 'creaciones_referral_credit'
const SHARE_COUNT_KEY = 'creaciones_referral_shares'
export const FRIEND_DISCOUNT = 10
const OWNER_REWARD = 5

export const REFERRAL_MILESTONES = [
  { count: 1, label: 'Primer Paso', icon: 'front_hand' },
  { count: 3, label: 'Embajador Bronce', icon: 'workspace_premium' },
  { count: 5, label: 'Embajador Plata', icon: 'military_tech' },
  { count: 10, label: 'Embajador Oro', icon: 'emoji_events' },
]

export function getReferralCode(name = '') {
  try {
    const existing = localStorage.getItem(REFERRAL_KEY)
    if (existing) return existing
    const base = (name || 'CREABABY').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'CREABABY'
    const code = `${base}${Math.floor(10 + Math.random() * 89)}`
    localStorage.setItem(REFERRAL_KEY, code)
    return code
  } catch {
    return 'CREABABY10'
  }
}

export function getReferralLink(code) {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.origin)
  url.searchParams.set('ref', code)
  return url.toString()
}

export function readReferralCode() {
  try {
    return new URLSearchParams(window.location.search).get('ref')
  } catch {
    return null
  }
}

export function getRewardMessage() {
  return `Recibe ${formatCurrency(FRIEND_DISCOUNT)} de descuento en tu primera compra`
}

export function getOwnerRewardMessage() {
  return `Gana ${formatCurrency(OWNER_REWARD)} por cada amigo que compra`
}

export function buildShareMessages(code) {
  const link = getReferralLink(code)
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `¡Hola! Te invito a descubrir CreacionesBaby 🍼, ropa y accesorios premium para bebés. Usa mi código ${code} y obtén ${formatCurrency(FRIEND_DISCOUNT)} de descuento en tu primera compra: ${link}`
    )}`,
    email: `mailto:?subject=${encodeURIComponent('Te invito a CreacionesBaby 🍼')}&body=${encodeURIComponent(
      `¡Hola!\n\nTe invito a descubrir CreacionesBaby, productos premium para bebés con envío a todo el país.\n\nUsa mi código ${code} y obtén ${formatCurrency(FRIEND_DISCOUNT)} de descuento en tu primera compra:\n${link}\n\n¡Con amor, CreacionesBaby!`
    )}`,
  }
}

export function registerFriendDiscount() {
  try {
    if (!localStorage.getItem(REFERRAL_CREDIT_KEY)) {
      localStorage.setItem(REFERRAL_CREDIT_KEY, JSON.stringify({ discount: FRIEND_DISCOUNT, applied: false }))
    }
  } catch {}
}

export function getFriendDiscount() {
  try {
    const data = JSON.parse(localStorage.getItem(REFERRAL_CREDIT_KEY) || 'null')
    return data && !data.applied ? FRIEND_DISCOUNT : 0
  } catch {
    return 0
  }
}

export function consumeFriendDiscount() {
  try {
    localStorage.setItem(REFERRAL_CREDIT_KEY, JSON.stringify({ discount: FRIEND_DISCOUNT, applied: true }))
  } catch {}
}

export function getReferralShareCount() {
  try {
    return Number(localStorage.getItem(SHARE_COUNT_KEY) || '0')
  } catch {
    return 0
  }
}

export function recordReferralShare() {
  try {
    const next = getReferralShareCount() + 1
    localStorage.setItem(SHARE_COUNT_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

export function getNextReferralMilestone(count) {
  return REFERRAL_MILESTONES.find((m) => m.count > count) || null
}
