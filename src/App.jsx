
import { useEffect, useState } from 'react'
import './App.css'
import { LoginPage } from './pages/auth/LoginPage'
import { RegistrationPage } from './pages/auth/RegistrationPage'
import { CollectionPage } from './pages/app/CollectionPage'
import { UserHome } from './pages/app/UserHome'
import { LandingPage } from './pages/landing/LandingPage'
import {
  CharacterCreatePage,
  CharacterEditPage,
  CharacterIndexPage,
  CharacterShowPage,
} from './resources/characters/CharacterResource'
import {
  FactionCreatePage,
  FactionEditPage,
  FactionIndexPage,
  FactionShowPage,
} from './resources/factions/FactionResource'
import {
  FamilyCreatePage,
  FamilyEditPage,
  FamilyIndexPage,
  FamilyShowPage,
} from './resources/families/FamilyResource'
import {
  FamilyTreeEditPage,
  FamilyTreeShowPage,
} from './resources/familyTrees/FamilyTreeResource'
import { RESOURCE_CONFIG } from './concerns/resourceConfig'
import {
  UniverseCreatePage,
  UniverseEditPage,
  UniverseIndexPage,
  UniverseShowPage,
} from './resources/universes/UniverseResource'
import {
  WorldCreatePage,
  WorldEditPage,
  WorldIndexPage,
  WorldShowPage,
} from './resources/worlds/WorldResource'
import {
  clearSession,
  getInitialEmail,
  getInitialRoute,
  getStoredUser,
} from './concerns/session'

// Maps every generic resource kind to the concrete page components used by the route switch.
const RESOURCE_PAGES = {
  characters: {
    CreatePage: CharacterCreatePage,
    EditPage: CharacterEditPage,
    IndexPage: CharacterIndexPage,
    ShowPage: CharacterShowPage,
  },
  factions: {
    CreatePage: FactionCreatePage,
    EditPage: FactionEditPage,
    IndexPage: FactionIndexPage,
    ShowPage: FactionShowPage,
  },
  families: {
    CreatePage: FamilyCreatePage,
    EditPage: FamilyEditPage,
    IndexPage: FamilyIndexPage,
    ShowPage: FamilyShowPage,
  },
  universes: {
    CreatePage: UniverseCreatePage,
    EditPage: UniverseEditPage,
    IndexPage: UniverseIndexPage,
    ShowPage: UniverseShowPage,
  },
  worlds: {
    CreatePage: WorldCreatePage,
    EditPage: WorldEditPage,
    IndexPage: WorldIndexPage,
    ShowPage: WorldShowPage,
  },
}

// Owns top-level SPA routing, auth state, and the navigation callbacks passed to pages.
function App() {
  // Route is stored in React state instead of using React Router.
  const [route, setRoute] = useState(getInitialRoute)
  // Email can be carried from landing/signup/login via a query param.
  const [prefilledEmail, setPrefilledEmail] = useState(getInitialEmail)
  // Current user is restored from localStorage so refreshes keep the header populated.
  const [currentUser, setCurrentUser] = useState(getStoredUser)

  // Pushes a browser-history entry and updates the lightweight route state used by this app.
  const navigate = (path, email = '') => {
    const target = new URL(path, window.location.origin)
    if (email) target.searchParams.set('email', email)

    window.history.pushState({}, '', target.pathname + target.search)
    setPrefilledEmail(email || target.searchParams.get('email') || '')
    setRoute(target.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Clears persisted auth data, resets the current user, and returns to the public landing page.
  const logout = () => {
    clearSession()
    setCurrentUser(null)
    navigate('/')
  }

  // Shows the login page for protected routes and continues to the original destination after auth.
  const renderLoginGate = (redirectTo) => (
    <LoginPage
      initialEmail={prefilledEmail}
      onBackHome={() => navigate('/')}
      onGoRegister={(email = '') => navigate('/register', email)}
      onAuthenticated={(user) => {
        setCurrentUser(user)
        navigate(redirectTo)
      }}
    />
  )

  useEffect(() => {
    // Keeps browser back/forward buttons in sync with the route state.
    const handlePopState = () => {
      setRoute(getInitialRoute())
      setPrefilledEmail(getInitialEmail())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  if (route === '/register') {
    return (
      <RegistrationPage
        initialEmail={prefilledEmail}
        onBackHome={() => navigate('/')}
        onGoLogin={(email = '') => navigate('/login', email)}
        onAuthenticated={(user) => {
          setCurrentUser(user)
          navigate('/app')
        }}
      />
    )
  }

  if (route === '/login') {
    return (
      <LoginPage
        initialEmail={prefilledEmail}
        onBackHome={() => navigate('/')}
        onGoRegister={(email = '') => navigate('/register', email)}
        onAuthenticated={(user) => {
          setCurrentUser(user)
          navigate('/app')
        }}
      />
    )
  }

  // Public resource indexes, protected by login because they include the user's private records.
  const resourceRoute = route.match(
    /^\/(universes|worlds|characters|families|factions)$/,
  )
  if (resourceRoute) {
    const [, kind] = resourceRoute
    if (!localStorage.getItem('roleplayHubToken')) return renderLoginGate(route)

    const { IndexPage } = RESOURCE_PAGES[kind]
    return (
      <IndexPage
        user={currentUser}
        onBack={() => navigate('/app')}
        onLogout={logout}
        onNavigate={navigate}
      />
    )
  }

  // Shared create pages for each top-level resource type.
  const newResourceRoute = route.match(
    /^\/(universes|worlds|characters|families|factions)\/new$/,
  )
  if (newResourceRoute) {
    const [, kind] = newResourceRoute
    if (!localStorage.getItem('roleplayHubToken')) return renderLoginGate(route)

    const { CreatePage } = RESOURCE_PAGES[kind]
      return (
        <CreatePage
          user={currentUser}
          onBack={() => navigate('/' + kind)}
          onCreated={(resource) => navigate('/' + kind + '/' + resource.id)}
          onLogout={logout}
          onNavigate={navigate}
        />
      )
  }

  // Shared show/edit pages for individual resources.
  const showOrEditRoute = route.match(
    /^\/(universes|worlds|characters|families|factions)\/(\d+)(\/edit)?$/,
  )
  if (showOrEditRoute) {
    const [, kind, id, editSegment] = showOrEditRoute
    if (!localStorage.getItem('roleplayHubToken')) return renderLoginGate(route)

    const { EditPage, ShowPage } = RESOURCE_PAGES[kind]
    if (editSegment) {
      return (
        <EditPage
          id={id}
          user={currentUser}
          onBack={() => navigate('/' + kind + '/' + id)}
          onLogout={logout}
          onNavigate={navigate}
          onSaved={() => navigate('/' + kind + '/' + id)}
        />
      )
    }

    return (
      <ShowPage
        id={id}
        user={currentUser}
        onBack={() => navigate('/' + kind)}
        onEdit={() => navigate('/' + kind + '/' + id + '/edit')}
        onLogout={logout}
        onNavigate={navigate}
      />
    )
  }

  // Family trees have their own canvas UI, so they are routed outside RESOURCE_PAGES.
  const familyTreeRoute = route.match(/^\/family_trees\/(\d+)(\/edit)?$/)
  if (familyTreeRoute) {
    const [, id, editSegment] = familyTreeRoute
    if (!localStorage.getItem('roleplayHubToken')) return renderLoginGate(route)

    if (editSegment) {
      return (
        <FamilyTreeEditPage
          id={id}
          user={currentUser}
          onBack={() => navigate('/family_trees/' + id)}
          onLogout={logout}
          onNavigate={navigate}
        />
      )
    }

    return (
      <FamilyTreeShowPage
        id={id}
        user={currentUser}
        onBack={() => navigate('/families')}
        onEdit={() => navigate('/family_trees/' + id + '/edit')}
        onLogout={logout}
        onNavigate={navigate}
      />
    )
  }

  if (route === '/app' || route.startsWith('/app/')) {
    if (!localStorage.getItem('roleplayHubToken')) return renderLoginGate('/app')

    // Dashboard collection routes show only the current user's archived resources.
    const collectionRoute = route.match(
      /^\/app\/(characters|universes|worlds|families|factions)$/,
    )
    if (collectionRoute) {
      const [, kind] = collectionRoute
      return (
        <CollectionPage
          kind={kind}
          title={RESOURCE_CONFIG[kind].collectionTitle}
          user={currentUser}
          onBack={() => navigate('/app')}
          onLogout={logout}
          onNavigate={navigate}
        />
      )
    }

    return (
      <UserHome user={currentUser} onNavigate={navigate} onLogout={logout} />
    )
  }

  return (
    <LandingPage
      onLogin={(email = '') => navigate('/login', email)}
      onRegister={navigate}
    />
  )
}

export default App
