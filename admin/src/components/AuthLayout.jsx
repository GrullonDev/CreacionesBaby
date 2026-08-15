export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      {/* Brand panel — hidden on small screens, this is the "premium" half */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] w-80 h-80 rounded-full bg-baby-pink-dark/20 blur-3xl" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">child_care</span>
            </span>
            <span className="font-extrabold text-lg tracking-tight">Creaciones Baby</span>
          </div>

          <div className="space-y-5 max-w-sm">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/15 rounded-full px-3 py-1">
              Panel de Vendedor
            </span>
            <h1 className="text-3xl font-extrabold leading-tight">
              Todo tu negocio, en un solo lugar.
            </h1>
            <p className="text-sm text-white/75 leading-relaxed">
              Publica productos, controla tu inventario y prepárate para promociones y reportes —
              todo conectado a la misma tienda que ven tus clientes.
            </p>
          </div>

          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()} Creaciones Baby
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-extrabold text-2xl text-slate-900 dark:text-white">Creaciones Baby</h1>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">Panel de Vendedor</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
