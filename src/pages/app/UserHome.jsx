
import heroMockup from '../../assets/wiki-hero-mockup.svg'
import { AppHeader } from './AppHeader'

// Renders the authenticated landing dashboard after login.
export function UserHome({ user, onLogout, onNavigate }) {
  return (
    <main className="app-shell">
      <AppHeader user={user} onLogout={onLogout} onNavigate={onNavigate} />

      <section className="app-hero">
        <div>
          <p className="eyebrow">Your archive</p>
          <h1>Welcome back.</h1>
          <p>
            Your archive is ready for universes, worlds, characters, and the
            small details that make lore worth returning to.
          </p>
        </div>
        <img
          src={heroMockup}
          width="980"
          height="660"
          alt="Dark fantasy wiki dashboard mockup"
        />
      </section>
    </main>
  )
}
