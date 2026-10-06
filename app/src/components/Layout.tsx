import { NavLink, useLocation } from 'react-router-dom'
import { getCurrentAnalysis, isStorageAvailable } from '../store'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/fit-score', label: 'Fit score' },
  { path: '/gap-matrix', label: 'Gap matrix' },
  { path: '/7-day-plan', label: '7-day plan' },
  { path: '/mock-interview', label: 'Mock interview' },
  { path: '/review', label: 'Review' },
  { path: '/export', label: 'Export' },
  { path: '/history', label: 'History' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const analysis = getCurrentAnalysis()
  const hasAnalysis = analysis !== null

  function isActive(path: string): boolean {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">InterviewGap</h1>
      </header>

      <nav className="nav-desktop" aria-label="Main navigation">
        {navItems.map(item => {
          const disabled = item.path !== '/' && !hasAnalysis
          return (
            <NavLink
              key={item.path}
              to={disabled ? location.pathname : item.path}
              className={({ isActive: active }) =>
                `nav-link ${active || isActive(item.path) ? 'active' : ''} ${disabled ? 'disabled' : ''}`
              }
              onClick={e => { if (disabled) e.preventDefault() }}
              aria-disabled={disabled}
            >
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <main className="app-main" role="main">
        {!isStorageAvailable() ? (
          <div className="storage-banner" role="alert">
            <strong>Storage unavailable:</strong> Changes will not persist. Enable local storage in your browser settings.
          </div>
        ) : null}
        {children}
      </main>

      <footer className="app-footer">
        InterviewGap, personal productivity.
      </footer>

      <nav className="nav-phone" aria-label="Bottom navigation">
        {navItems.map(item => {
          const disabled = item.path !== '/' && !hasAnalysis
          return (
            <NavLink
              key={item.path}
              to={disabled ? location.pathname : item.path}
              className={({ isActive: active }) =>
                `nav-tab ${active || isActive(item.path) ? 'active' : ''} ${disabled ? 'disabled' : ''}`
              }
              onClick={e => { if (disabled) e.preventDefault() }}
              aria-disabled={disabled}
            >
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}