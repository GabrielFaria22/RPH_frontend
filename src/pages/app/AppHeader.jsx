const RESOURCE_LINKS = [
  { label: 'Universes', path: '/universes', value: 'universes' },
  { label: 'Worlds', path: '/worlds', value: 'worlds' },
  { label: 'Characters', path: '/characters', value: 'characters' },
  { label: 'Families', path: '/families', value: 'families' },
  { label: 'Factions', path: '/factions', value: 'factions' },
]

export function AppHeader({ activeResource = '', onLogout, onNavigate, user }) {
  const email = user?.email || 'Archivist'

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
