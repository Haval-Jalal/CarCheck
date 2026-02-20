import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-900">
          <p className="mb-2 text-4xl">⚠️</p>
          <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Något gick fel
          </h1>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Ett oväntat fel inträffade. Försök att ladda om sidan.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Ladda om
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
