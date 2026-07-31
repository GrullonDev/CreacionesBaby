import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { readReferralCode, registerFriendDiscount, getRewardMessage } from '../utils/referral'

export default function ReferralWelcome() {
  const [active, setActive] = useState(false)
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const ref = readReferralCode()
    if (ref) {
      registerFriendDiscount()
      setCode(ref)
      setActive(true)
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }, [])

  const handleDismiss = () => {
    setActive(false)
    if (window.history.length > 2) {
      navigate('/')
    }
  }

  if (!active) return null

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200/70 dark:border-emerald-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg flex-shrink-0">card_giftcard</span>
        <p className="text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex-grow min-w-0">
          <strong>{getRewardMessage()}</strong> en tu primera compra gracias a tu amigo con el código <strong className="tracking-wider">{code}</strong>. ¡Se aplicará automáticamente al pagar!
        </p>
        <button
          onClick={handleDismiss}
          className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 p-1 flex-shrink-0 cursor-pointer"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  )
}
