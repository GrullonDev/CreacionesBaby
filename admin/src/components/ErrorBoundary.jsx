import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Seller portal crashed:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined text-4xl text-slate-300">error</span>
        <div>
          <h1 className="font-extrabold text-lg text-slate-800 dark:text-white">Algo salió mal</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Ocurrió un error inesperado en el panel. Intenta volver al inicio.
          </p>
        </div>
        <button
          onClick={this.handleReload}
          className="bg-primary hover:bg-opacity-95 text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Volver al inicio
        </button>
      </div>
    )
  }
}
