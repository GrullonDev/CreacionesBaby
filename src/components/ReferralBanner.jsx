import { useState } from 'react'
import { useToast } from '../context/useToast'
import {
  getReferralCode,
  getReferralLink,
  buildShareMessages,
  getOwnerRewardMessage,
  FRIEND_DISCOUNT,
  REFERRAL_MILESTONES,
  getReferralShareCount,
  recordReferralShare,
  getNextReferralMilestone,
} from '../utils/referral'
import { formatCurrency } from '../utils/currency'
import { track } from '../utils/analytics'

export default function ReferralBanner({ customerName = '' }) {
  const { addToast } = useToast()
  const [code] = useState(() => getReferralCode(customerName))
  const [shareCount, setShareCount] = useState(() => getReferralShareCount())
  const share = buildShareMessages(code)
  const shareLink = getReferralLink(code)
  const nextMilestone = getNextReferralMilestone(shareCount)
  const lastMilestone = [...REFERRAL_MILESTONES].reverse().find((m) => m.count <= shareCount)
  const progressTarget = nextMilestone ? nextMilestone.count : REFERRAL_MILESTONES.at(-1).count
  const progressPct = Math.min(100, Math.round((shareCount / progressTarget) * 100))

  const trackShare = () => {
    setShareCount(recordReferralShare())
    track('referral_share', { code })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      addToast('Enlace de invitación copiado')
      trackShare()
    } catch {
      addToast('No se pudo copiar el enlace', 'error')
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      addToast(`Código ${code} copiado`)
      trackShare()
    } catch {
      addToast('No se pudo copiar el código', 'error')
    }
  }

  return (
    <div className="bg-gradient-to-br from-[#fff1f2] to-[#fdf4f2] dark:from-rose-950/30 dark:to-slate-900 border border-rose-100/70 dark:border-rose-900/40 rounded-2xl p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="size-10 rounded-full bg-white dark:bg-slate-900 text-primary dark:text-rose-300 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="material-symbols-outlined text-xl">card_giftcard</span>
        </div>
        <div>
          <h4 className="font-extrabold text-base text-[#5c4c3e] dark:text-white">Invita y gana con CreacionesBaby</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {getOwnerRewardMessage()} y tu amigo recibe {formatCurrency(FRIEND_DISCOUNT)} de descuento en su primera compra. ¡Comparte tu código y ambos ganan!
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Code display */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 rounded-xl px-4 py-3 flex-grow">
          <span className="material-symbols-outlined text-slate-300 text-lg">vpn_key</span>
          <span className="font-black tracking-[0.2em] text-primary dark:text-rose-300 text-sm">{code}</span>
          <button
            onClick={handleCopyCode}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors cursor-pointer"
            aria-label="Copiar código"
            title="Copiar código"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
          </button>
        </div>

        {/* Share actions */}
        <div className="flex gap-2">
          <a
            href={share.whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={trackShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            WhatsApp
          </a>
          <a
            href={share.email}
            onClick={trackShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Correo
          </a>
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary hover:text-primary text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-3 rounded-xl transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">link</span>
            Copiar
          </button>
        </div>
      </div>

      {/* Share progress / milestones */}
      <div className="mt-5 pt-5 border-t border-rose-100/60 dark:border-slate-800">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            {lastMilestone && (
              <span className="material-symbols-outlined text-sm text-primary dark:text-rose-300">{lastMilestone.icon}</span>
            )}
            {lastMilestone ? lastMilestone.label : 'Comparte para empezar'}
          </span>
          <span>
            {shareCount} {shareCount === 1 ? 'veces compartido' : 'veces compartidas'}
            {nextMilestone && ` · faltan ${nextMilestone.count - shareCount} para "${nextMilestone.label}"`}
          </span>
        </div>
        <div className="h-1.5 w-full bg-rose-100/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary dark:bg-rose-300 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {REFERRAL_MILESTONES.map((m) => (
            <span
              key={m.count}
              title={m.label}
              className={`material-symbols-outlined text-sm ${
                shareCount >= m.count ? 'text-primary dark:text-rose-300' : 'text-slate-300 dark:text-slate-700'
              }`}
            >
              {m.icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
