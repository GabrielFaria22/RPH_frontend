const RESOURCE_LINKS = [
  { label: 'Universes', path: '/universes', value: 'universes' },
  { label: 'Characters', path: '/characters', value: 'characters' },
]

// Renders the authenticated app header and central resource navigation.
export function AppHeader({ activeResource = '', onLogout, onNavigate, user }) {
  const email = user?.email || 'Archivist'

  // Routes anchor clicks through App's client-side navigator.
  const navigateTo = (event, path) => {
    event.preventDefault()
    onNavigate(path)
  }

  return (
    <header className="app-header">
      <a
        className="brand"
        href="/app"
        onClick={(event) => navigateTo(event, '/app')}
      >
        Roleplay Hub
      </a>
      <nav className="app-nav" aria-label="Browse resources">
        {RESOURCE_LINKS.map((link) => (
          <a
            className={link.value === activeResource ? 'active' : ''}
            href={link.path}
            key={link.value}
            onClick={(event) => navigateTo(event, link.path)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div>
        <span>{email}</span>
        <button type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}
