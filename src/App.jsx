import { useEffect, useMemo, useState } from 'react'
import characterMockup from './assets/wiki-character-mockup.svg'
import heroMockup from './assets/wiki-hero-mockup.svg'
import universeMockup from './assets/wiki-universe-mockup.svg'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const trendingWikis = [
  'Forgotten Realms',
  'Middle-earth',
  'Night City',
  'Greek Mythology',
  'Personal Campaigns',
  'Original Worlds',
]

const reasons = [
  {
    title: 'Build any universe',
    text: 'Document fictional canons, real histories, private campaigns, or entirely original settings.',
  },
  {
    title: 'Connect worlds and characters',
    text: 'Organize worlds inside universes, then link characters through stories, images, and relationships.',
  },
  {
    title: 'Write like a wiki',
    text: 'Create clean reference pages with lore, timelines, aliases, occupations, appearances, and backstories.',
  },
  {
    title: 'Keep your archive yours',
    text: 'Start with a private creative vault, then grow it into the reference hub your community needs.',
  },
]

const faqs = [
  {
    question: 'What is Roleplay Hub?',
    answer:
      'Roleplay Hub is a wiki-style home for universes, worlds, characters, and relationships from any story setting.',
  },
  {
    question: 'Can I create my own universe?',
    answer:
      'Yes. You can create original universes, add worlds inside them, and build character pages with their own stories.',
  },
  {
    question: 'Is it only for fandoms?',
    answer:
      'No. It can work for fandom references, roleplay campaigns, novels, historical worlds, or personal creative projects.',
  },
  {
    question: 'Can characters be connected?',
    answer:
      'Yes. The app supports character relationships such as allies, rivals, family, mentors, partners, enemies, and more.',
  },
]

function getInitialEmail() {
  return new URLSearchParams(window.location.search).get('email') || ''
}

function getStoredUser() {
  const storedUser = localStorage.getItem('roleplayHubUser')
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

function getInitialRoute() {
  const path = window.location.pathname
  const token = localStorage.getItem('roleplayHubToken')
  return path === '/' && token ? '/app' : path
}

function storeSession(payload) {
  localStorage.setItem('roleplayHubToken', payload.token)
  localStorage.setItem('roleplayHubUser', JSON.stringify(payload.data))
  return payload.data
}

async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return payload
}

async function patchFormData(path, formData) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not save your changes.'
    throw new Error(message)
  }

  return payload
}

async function getJson(path) {
  const token = localStorage.getItem('roleplayHubToken')
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload.errors?.join(' ') ||
      payload.status?.message ||
      'Could not load your archive yet.'
    throw new Error(message)
  }

  return payload
}

function useArchiveData() {
  const [archive, setArchive] = useState({
    characters: [],
    universes: [],
    worlds: [],
  })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadArchive() {
      try {
        const [characters, universes, worlds] = await Promise.all([
          getJson('/api/v1/characters/mine'),
          getJson('/api/v1/universes/mine'),
          getJson('/api/v1/worlds/mine'),
        ])

        if (!isMounted) return

        setArchive({
          characters: sortByCreatedAt(characters),
          universes: sortByCreatedAt(universes),
          worlds: sortByCreatedAt(worlds),
        })
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadArchive()

    return () => {
      isMounted = false
    }
  }, [])

  return { archive, error, status }
}

function usePublicResources(kind) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadResources() {
      try {
        const resources = await getJson(`/api/v1/${kind}`)
        if (!isMounted) return
        setItems(sortByCreatedAt(resources))
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadResources()

    return () => {
      isMounted = false
    }
  }, [kind])

  return { error, items, status }
}

function useUniverse(id) {
  const [universe, setUniverse] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadUniverse() {
      try {
        const resource = await getJson(`/api/v1/universes/${id}`)
        if (!isMounted) return
        setUniverse(resource)
        setStatus('ready')
      } catch (loadError) {
        if (!isMounted) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    loadUniverse()

    return () => {
      isMounted = false
    }
  }, [id])

  return { error, status, universe, setUniverse }
}

function sortByCreatedAt(items) {
  return [...items].sort(
    (first, second) =>
      new Date(second.created_at || 0).getTime() -
      new Date(first.created_at || 0).getTime(),
  )
}

function summarize(text, fallback) {
  const cleanText = (text || fallback).trim()
  if (cleanText.length <= 112) return cleanText
  return `${cleanText.slice(0, 109).trim()}...`
}

function initialsFor(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function resourceImage(resource) {
  const path = resource.cover_image?.url || resource.portrait_image?.url
  return path ? `${API_URL}${path}` : ''
}

function resourcePortrait(resource) {
  const path = resource.portrait_image?.url || resource.cover_image?.url
  return path ? `${API_URL}${path}` : ''
}

function attachmentUrl(attachment) {
  return attachment?.url ? `${API_URL}${attachment.url}` : ''
}

function normalizeEditableHtml(value) {
  if (!value.trim()) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value

  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function sanitizeArticleHtml(rawHtml) {
  const fallbackHtml =
    '<h2>Overview</h2><p>This universe does not have a written article yet.</p>'
  const parser = new DOMParser()
  const doc = parser.parseFromString(
    normalizeEditableHtml(rawHtml || fallbackHtml),
    'text/html',
  )
  const allowedTags = new Set([
    'A',
    'B',
    'BLOCKQUOTE',
    'BR',
    'CODE',
    'EM',
    'H2',
    'H3',
    'H4',
    'HR',
    'I',
    'IMG',
    'LI',
    'OL',
    'P',
    'PRE',
    'STRONG',
    'TABLE',
    'TBODY',
    'TD',
    'TH',
    'THEAD',
    'TR',
    'UL',
  ])
  const toc = []

  doc.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...element.childNodes)
      return
    }

    ;[...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value
      const isSafeUrl =
        /^(https?:|mailto:|#)/i.test(value) && !/javascript:/i.test(value)
      const keepAttribute =
        (element.tagName === 'A' && name === 'href' && isSafeUrl) ||
        (element.tagName === 'IMG' && name === 'src' && /^https?:/i.test(value)) ||
        (['alt', 'title'].includes(name) && ['A', 'IMG'].includes(element.tagName))

      if (!keepAttribute) element.removeAttribute(attribute.name)
    })

    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noreferrer')
    }

    if (element.tagName === 'IMG') {
      element.setAttribute('loading', 'lazy')
    }

    if (['H2', 'H3'].includes(element.tagName)) {
      const title = element.textContent.trim()
      if (!title) return

      const id = slugify(title) || `section-${toc.length + 1}`
      element.id = id
      toc.push({ id, level: element.tagName === 'H2' ? 2 : 3, title })
    }
  })

  if (toc.length === 0) {
    toc.push({ id: 'article', level: 2, title: 'Article' })
  }

  return { html: doc.body.innerHTML, toc }
}

function parseArticleSections(rawHtml) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(normalizeEditableHtml(rawHtml || ''), 'text/html')
  const sections = []
  let intro = []
  let currentSection = null

  ;[...doc.body.children].forEach((element) => {
    if (element.tagName === 'H2') {
      currentSection = { body: '', title: element.textContent.trim() }
      sections.push(currentSection)
      return
    }

    const text = element.textContent.trim()
    if (!text) return

    if (currentSection) {
      currentSection.body = [currentSection.body, text].filter(Boolean).join('\n\n')
    } else {
      intro.push(text)
    }
  })

  return {
    intro: intro.join('\n\n'),
    sections:
      sections.length > 0
        ? sections
        : [{ body: '', title: 'Overview' }],
  }
}

function paragraphsToHtml(text) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function sectionsToHtml(article) {
  const introHtml = paragraphsToHtml(article.intro)
  const sectionHtml = article.sections
    .filter((section) => section.title.trim() || section.body.trim())
    .map(
      (section) =>
        `<h2>${escapeHtml(section.title.trim() || 'Untitled section')}</h2>${paragraphsToHtml(section.body)}`,
    )
    .join('')

  return `${introHtml}${sectionHtml}` || '<h2>Overview</h2><p>Write your article here.</p>'
}

function App() {
  const [route, setRoute] = useState(getInitialRoute)
  const [prefilledEmail, setPrefilledEmail] = useState(getInitialEmail)
  const [currentUser, setCurrentUser] = useState(getStoredUser)

  const navigate = (path, email = '') => {
    const url = email ? `${path}?email=${encodeURIComponent(email)}` : path
    window.history.pushState({}, '', url)
    setPrefilledEmail(email)
    setRoute(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
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

  if (route === '/universes' || route === '/worlds' || route === '/characters') {
    const kind = route.slice(1)
    const titles = {
      characters: 'All Characters',
      universes: 'All Universes',
      worlds: 'All Worlds',
    }

    if (!localStorage.getItem('roleplayHubToken')) {
      return (
        <LoginPage
          initialEmail={prefilledEmail}
          onBackHome={() => navigate('/')}
          onGoRegister={(email = '') => navigate('/register', email)}
          onAuthenticated={(user) => {
            setCurrentUser(user)
            navigate(route)
          }}
        />
      )
    }

    return (
      <PublicIndexPage
        kind={kind}
        title={titles[kind]}
        user={currentUser}
        onBack={() => navigate('/app')}
        onLogout={() => {
          localStorage.removeItem('roleplayHubToken')
          localStorage.removeItem('roleplayHubUser')
          setCurrentUser(null)
          navigate('/')
        }}
        onNavigate={navigate}
      />
    )
  }

  if (/^\/universes\/\d+(\/edit)?$/.test(route)) {
    const [, id, editSegment] = route.match(/^\/universes\/(\d+)(\/edit)?$/)

    if (!localStorage.getItem('roleplayHubToken')) {
      return (
        <LoginPage
          initialEmail={prefilledEmail}
          onBackHome={() => navigate('/')}
          onGoRegister={(email = '') => navigate('/register', email)}
          onAuthenticated={(user) => {
            setCurrentUser(user)
            navigate(route)
          }}
        />
      )
    }

    if (editSegment) {
      return (
        <UniverseEditPage
          id={id}
          user={currentUser}
          onBack={() => navigate(`/universes/${id}`)}
          onLogout={() => {
            localStorage.removeItem('roleplayHubToken')
            localStorage.removeItem('roleplayHubUser')
            setCurrentUser(null)
            navigate('/')
          }}
          onSaved={() => navigate(`/universes/${id}`)}
        />
      )
    }

    return (
      <UniverseShowPage
        id={id}
        user={currentUser}
        onBack={() => navigate('/universes')}
        onEdit={() => navigate(`/universes/${id}/edit`)}
        onLogout={() => {
          localStorage.removeItem('roleplayHubToken')
          localStorage.removeItem('roleplayHubUser')
          setCurrentUser(null)
          navigate('/')
        }}
      />
    )
  }

  if (route === '/app' || route.startsWith('/app/')) {
    if (!localStorage.getItem('roleplayHubToken')) {
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

    if (route === '/app/characters') {
      return (
        <CollectionPage
          kind="characters"
          title="My Characters"
          user={currentUser}
          onBack={() => navigate('/app')}
          onLogout={() => {
            localStorage.removeItem('roleplayHubToken')
            localStorage.removeItem('roleplayHubUser')
            setCurrentUser(null)
            navigate('/')
          }}
        />
      )
    }

    if (route === '/app/universes') {
      return (
        <CollectionPage
          kind="universes"
          title="My Universes"
          user={currentUser}
          onBack={() => navigate('/app')}
          onLogout={() => {
            localStorage.removeItem('roleplayHubToken')
            localStorage.removeItem('roleplayHubUser')
            setCurrentUser(null)
            navigate('/')
          }}
        />
      )
    }

    if (route === '/app/worlds') {
      return (
        <CollectionPage
          kind="worlds"
          title="My Worlds"
          user={currentUser}
          onBack={() => navigate('/app')}
          onLogout={() => {
            localStorage.removeItem('roleplayHubToken')
            localStorage.removeItem('roleplayHubUser')
            setCurrentUser(null)
            navigate('/')
          }}
        />
      )
    }

    return (
      <SignedInHome
        user={currentUser}
        onNavigate={navigate}
        onLogout={() => {
          localStorage.removeItem('roleplayHubToken')
          localStorage.removeItem('roleplayHubUser')
          setCurrentUser(null)
          navigate('/')
        }}
      />
    )
  }

  return (
    <LandingPage
      onLogin={(email = '') => navigate('/login', email)}
      onRegister={navigate}
    />
  )
}

function LandingPage({ onLogin, onRegister }) {
  const [heroEmail, setHeroEmail] = useState('')
  const [footerEmail, setFooterEmail] = useState('')

  const submitEmail = (event, email) => {
    event.preventDefault()
    onRegister('/register', email.trim())
  }

  return (
    <main className="landing-shell">
      <section className="hero-section" id="home">
        <header className="site-header" aria-label="Primary navigation">
          <a className="brand" href="#home" aria-label="Roleplay Hub home">
            Roleplay Hub
          </a>
          <nav className="nav-links" aria-label="Main menu">
            <a href="#discover">Discover</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a
            className="sign-in"
            href="/login"
            onClick={(event) => {
              event.preventDefault()
              onLogin()
            }}
          >
            Sign In
          </a>
        </header>

        <div className="hero-content">
          <p className="eyebrow">Worlds, characters, lore, relationships</p>
          <h1>The wiki for every universe you can imagine.</h1>
          <p className="hero-lede">
            Explore existing worlds or create your own archive of characters,
            places, histories, and stories in a dark fantasy hub built for lore.
          </p>
          <form
            className="signup-form"
            id="start"
            onSubmit={(event) => submitEmail(event, heroEmail)}
          >
            <label htmlFor="email">Ready to start your archive?</label>
            <div>
              <input
                id="email"
                type="email"
                placeholder="Email address"
                value={heroEmail}
                onChange={(event) => setHeroEmail(event.target.value)}
              />
              <button type="submit">Get Started</button>
            </div>
          </form>
        </div>

        <img
          className="hero-mockup"
          src={heroMockup}
          width="980"
          height="660"
          alt="Dark fantasy wiki dashboard mockup"
        />
      </section>

      <section className="content-band" id="discover">
        <div className="section-heading">
          <p className="eyebrow">Trending archives</p>
          <h2>Browse the shelves of known and unknown worlds.</h2>
        </div>
        <div className="wiki-row" aria-label="Example universe categories">
          {trendingWikis.map((wiki, index) => (
            <article className="wiki-card" key={wiki}>
              <span>{index + 1}</span>
              <h3>{wiki}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section">
        <div className="showcase-copy">
          <p className="eyebrow">Create the canon</p>
          <h2>Turn scattered notes into a living universe.</h2>
          <p>
            Give every universe a home page, every world a place in the map, and
            every character a profile with history, images, and connections.
          </p>
        </div>
        <img
          src={universeMockup}
          width="760"
          height="540"
          alt="Universe wiki page mockup"
        />
      </section>

      <section className="reasons-section" id="features">
        <div className="section-heading">
          <p className="eyebrow">More reasons to build</p>
          <h2>A lore archive that can grow from one page to a multiverse.</h2>
        </div>
        <div className="reasons-grid">
          {reasons.map((reason) => (
            <article className="reason-card" key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="character-section">
        <img
          src={characterMockup}
          width="760"
          height="560"
          alt="Character wiki page mockup"
        />
        <div className="showcase-copy">
          <p className="eyebrow">Character pages</p>
          <h2>Profiles with stories, portraits, and relationship trails.</h2>
          <p>
            Capture the details that make a character memorable, then connect
            them to allies, enemies, families, worlds, and universes.
          </p>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <form
          className="signup-form bottom-form"
          onSubmit={(event) => submitEmail(event, footerEmail)}
        >
          <label htmlFor="footer-email">Create your first universe today.</label>
          <div>
            <input
              id="footer-email"
              type="email"
              placeholder="Email address"
              value={footerEmail}
              onChange={(event) => setFooterEmail(event.target.value)}
            />
            <button type="submit">Get Started</button>
          </div>
        </form>
      </section>

      <footer className="site-footer">
        <p>Roleplay Hub</p>
        <div>
          <a href="#discover">Discover</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </main>
  )
}

function RegistrationPage({
  initialEmail,
  onAuthenticated,
  onBackHome,
  onGoLogin,
}) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const canSubmit = useMemo(
    () =>
      email.trim() &&
      password.length >= 6 &&
      password === passwordConfirmation &&
      status !== 'loading',
    [email, password, passwordConfirmation, status],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      await postJson('/api/v1/auth/signup', {
        user: {
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        },
      })

      const loginPayload = await postJson('/api/v1/auth/login', {
        user: { email: email.trim(), password },
      })

      const user = storeSession(loginPayload)
      setStatus('success')
      setMessage('Your account is ready. You are signed in.')
      onAuthenticated(user)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <main className="register-shell">
      <header className="register-header">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onBackHome()
          }}
        >
          Roleplay Hub
        </a>
        <a
          className="ghost-link"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onBackHome()
          }}
        >
          Back to home
        </a>
      </header>

      <section className="register-layout">
        <div className="register-copy">
          <p className="eyebrow">Begin the archive</p>
          <h1>Create your Roleplay Hub account.</h1>
          <p>
            Claim a space for your universes, worlds, characters, and the
            relationship maps that make every story easier to explore.
          </p>
          <div className="register-preview">
            <img
              src={characterMockup}
              width="760"
              height="560"
              alt="Character wiki page mockup"
            />
          </div>
        </div>

        <form className="registration-card" onSubmit={handleSubmit}>
          <h2>Sign up</h2>
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength="6"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <label htmlFor="register-password-confirmation">
            Confirm password
          </label>
          <input
            id="register-password-confirmation"
            type="password"
            autoComplete="new-password"
            minLength="6"
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />

          {passwordConfirmation && password !== passwordConfirmation ? (
            <p className="form-hint error">Passwords do not match yet.</p>
          ) : (
            <p className="form-hint">Use at least 6 characters.</p>
          )}

          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>

          {message ? (
            <p className={`form-message ${status}`}>{message}</p>
          ) : null}

          <p className="auth-switch">
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(event) => {
                event.preventDefault()
                onGoLogin(email.trim())
              }}
            >
              Sign in
            </a>
          </p>
        </form>
      </section>
    </main>
  )
}

function LoginPage({ initialEmail, onAuthenticated, onBackHome, onGoRegister }) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const canSubmit = email.trim() && password && status !== 'loading'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const loginPayload = await postJson('/api/v1/auth/login', {
        user: { email: email.trim(), password },
      })
      const user = storeSession(loginPayload)
      setStatus('success')
      setMessage('Welcome back. Opening your hub.')
      onAuthenticated(user)
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <main className="register-shell">
      <header className="register-header">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onBackHome()
          }}
        >
          Roleplay Hub
        </a>
        <a
          className="ghost-link"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onBackHome()
          }}
        >
          Back to home
        </a>
      </header>

      <section className="register-layout login-layout">
        <div className="register-copy">
          <p className="eyebrow">Return to the archive</p>
          <h1>Sign in to continue building your worlds.</h1>
          <p>
            Pick up where you left off with your universes, character pages,
            worlds, stories, and relationship maps.
          </p>
          <div className="register-preview">
            <img
              src={universeMockup}
              width="760"
              height="540"
              alt="Universe wiki page mockup"
            />
          </div>
        </div>

        <form className="registration-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>

          {message ? (
            <p className={`form-message ${status}`}>{message}</p>
          ) : null}

          <p className="auth-switch">
            New to Roleplay Hub?{' '}
            <a
              href="/register"
              onClick={(event) => {
                event.preventDefault()
                onGoRegister(email.trim())
              }}
            >
              Create an account
            </a>
          </p>
        </form>
      </section>
    </main>
  )
}

function SignedInHome({ user, onLogout, onNavigate }) {
  const email = user?.email || 'Archivist'
  const { archive, error, status } = useArchiveData()
  const summaryCards = [
    {
      count: archive.universes.length,
      title: 'Universes',
      text: 'Top-level archives for canons, campaigns, histories, and original settings.',
    },
    {
      count: archive.worlds.length,
      title: 'Worlds',
      text: 'Places inside your universes, from cities and realms to planets and eras.',
    },
    {
      count: archive.characters.length,
      title: 'Characters',
      text: 'Profiles with stories, portraits, details, and relationship trails.',
    },
  ]

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href="/app">
          Roleplay Hub
        </a>
        <nav className="app-nav" aria-label="Browse resources">
          <a
            href="/universes"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/universes')
            }}
          >
            Universes
          </a>
          <a
            href="/worlds"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/worlds')
            }}
          >
            Worlds
          </a>
          <a
            href="/characters"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/characters')
            }}
          >
            Characters
          </a>
        </nav>
        <div>
          <span>{email}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="app-hero">
        <div>
          <p className="eyebrow">Your archive</p>
          <h1>Welcome back.</h1>
          <p>
            Your archive is ready for universes, worlds, characters, and the
            small details that make lore worth returning to.
          </p>
          <div className="app-actions">
            <button type="button">Create universe</button>
            <button type="button" className="secondary-action">
              Add character
            </button>
          </div>
        </div>
        <img
          src={heroMockup}
          width="980"
          height="660"
          alt="Dark fantasy wiki dashboard mockup"
        />
      </section>

      <section className="dashboard-grid" aria-label="Archive summary">
        {summaryCards.map((card) => (
          <article key={card.title}>
            <span>{card.count}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      {status === 'error' ? (
        <p className="archive-error">{error}</p>
      ) : null}

      <section className="archive-preview-grid" aria-label="Archive previews">
        <PreviewPanel
          emptyText="No characters yet. Create a character to start building your cast."
          href="/app/characters"
          isLoading={status === 'loading'}
          items={archive.characters.slice(0, 5)}
          kind="characters"
          title="Recently Created Characters"
          viewLabel="My Characters"
          onNavigate={onNavigate}
        />
        <PreviewPanel
          emptyText="No universes yet. Create a universe to hold your worlds and lore."
          href="/app/universes"
          isLoading={status === 'loading'}
          items={archive.universes.slice(0, 5)}
          kind="universes"
          title="Recent Universes"
          viewLabel="My Universes"
          onNavigate={onNavigate}
        />
        <PreviewPanel
          emptyText="No worlds yet. Worlds will appear here after you add them to a universe."
          href="/app/worlds"
          isLoading={status === 'loading'}
          items={archive.worlds.slice(0, 5)}
          kind="worlds"
          title="Recent Worlds"
          viewLabel="My Worlds"
          onNavigate={onNavigate}
        />
      </section>
    </main>
  )
}

function PreviewPanel({
  emptyText,
  href,
  isLoading,
  items,
  kind,
  onNavigate,
  title,
  viewLabel,
}) {
  return (
    <section className="preview-panel">
      <a
        className="panel-heading-link"
        href={href}
        onClick={(event) => {
          event.preventDefault()
          onNavigate(href)
        }}
      >
        <span>{viewLabel}</span>
        <span aria-hidden="true">&rarr;</span>
      </a>
      <h2>{title}</h2>

      {isLoading ? <p className="empty-state">Loading your archive...</p> : null}

      {!isLoading && items.length === 0 ? (
        <p className="empty-state">{emptyText}</p>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <div className="preview-list">
          {items.map((item) => (
            <ArchiveListItem item={item} key={item.id} kind={kind} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ArchiveListItem({ item, kind }) {
  const description =
    kind === 'characters'
      ? item.description || item.story || item.occupation
      : item.description
  const fallback =
    kind === 'characters'
      ? 'A character page waiting for story details.'
      : 'A wiki page waiting for a description.'
  const image = resourceImage(item)

  return (
    <article className="archive-list-item">
      {image ? (
        <img src={image} alt="" />
      ) : (
        <div className={`archive-avatar ${kind}`} aria-hidden="true">
          {initialsFor(item.name || 'RH')}
        </div>
      )}
      <div>
        <h3>{item.name}</h3>
        <p>{summarize(description, fallback)}</p>
      </div>
    </article>
  )
}

function CollectionPage({ kind, onBack, onLogout, title, user }) {
  const email = user?.email || 'Archivist'
  const { archive, error, status } = useArchiveData()
  const items = archive[kind]

  return (
    <main className="app-shell">
      <header className="app-header">
        <a
          className="brand"
          href="/app"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          Roleplay Hub
        </a>
        <div>
          <span>{email}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="collection-page">
        <button className="back-button" type="button" onClick={onBack}>
          Back to home
        </button>
        <p className="eyebrow">Your archive</p>
        <h1>{title}</h1>

        {status === 'loading' ? (
          <p className="empty-state">Loading your archive...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="empty-state">There is nothing here yet.</p>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className="collection-list">
            {items.map((item) => (
              <ArchiveListItem item={item} key={item.id} kind={kind} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

function PublicIndexPage({
  kind,
  onBack,
  onLogout,
  onNavigate,
  title,
  user,
}) {
  const email = user?.email || 'Archivist'
  const { error, items, status } = usePublicResources(kind)

  return (
    <main className="app-shell">
      <header className="app-header">
        <a
          className="brand"
          href="/app"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          Roleplay Hub
        </a>
        <nav className="app-nav" aria-label="Browse resources">
          {['universes', 'worlds', 'characters'].map((item) => (
            <a
              className={item === kind ? 'active' : ''}
              href={`/${item}`}
              key={item}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(`/${item}`)
              }}
            >
              {item[0].toUpperCase() + item.slice(1)}
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

      <section className="public-index-page">
        <p className="eyebrow">Visible archive</p>
        <h1>{title}</h1>
        <p>
          Browse public resources and anything you own. Private resources from
          other users stay hidden.
        </p>

        {status === 'loading' ? (
          <p className="empty-state">Loading visible resources...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="empty-state">There is nothing visible here yet.</p>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <div className="cover-index-grid">
            {items.map((item) => (
              <CoverIndexCard
                item={item}
                key={item.id}
                kind={kind}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

function CoverIndexCard({ item, kind, onNavigate }) {
  const cover = resourceImage(item)
  const description =
    kind === 'characters'
      ? item.description || item.story || item.occupation
      : item.description
  const fallback =
    kind === 'characters'
      ? 'A character page waiting for story details.'
      : 'A wiki page waiting for a description.'

  const href = kind === 'universes' ? `/universes/${item.id}` : '#'

  return (
    <a
      className={`cover-index-card ${kind}`}
      href={href}
      onClick={(event) => {
        if (kind !== 'universes') {
          event.preventDefault()
          return
        }

        event.preventDefault()
        onNavigate(href)
      }}
    >
      {cover ? (
        <img src={cover} alt="" />
      ) : (
        <div className="cover-fallback" aria-hidden="true">
          {initialsFor(item.name || 'RH')}
        </div>
      )}
      <div className="cover-shade" aria-hidden="true" />
      <div className="cover-card-content">
        <span>{item.public ? 'Public' : 'Mine'}</span>
        <h2>{item.name}</h2>
        <p>{summarize(description, fallback)}</p>
      </div>
    </a>
  )
}

function UniverseShowPage({ id, onBack, onEdit, onLogout, user }) {
  const email = user?.email || 'Archivist'
  const { error, status, universe } = useUniverse(id)
  const article = useMemo(
    () => sanitizeArticleHtml(universe?.description || ''),
    [universe?.description],
  )
  const cover = universe ? resourceImage(universe) : ''
  const portrait = universe ? resourcePortrait(universe) : ''

  return (
    <main className="app-shell">
      <header className="app-header">
        <a
          className="brand"
          href="/app"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          Roleplay Hub
        </a>
        <div>
          <span>{email}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      {status === 'loading' ? (
        <section className="wiki-article-shell">
          <p className="empty-state">Loading universe...</p>
        </section>
      ) : null}

      {status === 'error' ? <p className="archive-error">{error}</p> : null}

      {status === 'ready' && universe ? (
        <article className="wiki-article-shell">
          <div
            className="wiki-cover"
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          />
          <div className="wiki-article-actions">
            <button className="back-button" type="button" onClick={onBack}>
              Back to universes
            </button>
            <button className="back-button" type="button" onClick={onEdit}>
              Edit page
            </button>
          </div>

          <header className="wiki-title-block">
            <p className="eyebrow">Universe</p>
            <h1>{universe.name}</h1>
            <span>{universe.public ? 'Public page' : 'Private page'}</span>
          </header>

          <div className="wiki-layout">
            <aside className="wiki-toc" aria-label="Contents">
              <h2>Contents</h2>
              <ol>
                {article.toc.map((item) => (
                  <li className={`toc-level-${item.level}`} key={item.id}>
                    <a href={`#${item.id}`}>{item.title}</a>
                  </li>
                ))}
              </ol>
            </aside>

            <div
              className="wiki-body"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <aside className="wiki-infobox" aria-label={`${universe.name} summary`}>
              {portrait ? (
                <img src={portrait} alt="" />
              ) : (
                <div className="infobox-fallback" aria-hidden="true">
                  {initialsFor(universe.name)}
                </div>
              )}
              <h2>{universe.name}</h2>
              <dl>
                <div>
                  <dt>Visibility</dt>
                  <dd>{universe.public ? 'Public' : 'Private'}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{new Date(universe.created_at).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(universe.updated_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </article>
      ) : null}
    </main>
  )
}

function UniverseEditPage({ id, onBack, onLogout, onSaved, user }) {
  const email = user?.email || 'Archivist'
  const { error, status, universe, setUniverse } = useUniverse(id)

  return (
    <main className="app-shell">
      <header className="app-header">
        <a
          className="brand"
          href="/app"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          Roleplay Hub
        </a>
        <div>
          <span>{email}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="edit-page">
        <button className="back-button" type="button" onClick={onBack}>
          Back to article
        </button>
        <p className="eyebrow">Edit universe</p>
        <h1>{status === 'ready' ? universe?.name : 'Universe article'}</h1>

        {status === 'loading' ? (
          <p className="empty-state">Loading editor...</p>
        ) : null}
        {status === 'error' ? <p className="archive-error">{error}</p> : null}

        {status === 'ready' && universe ? (
          <UniverseEditorForm
            key={universe.id}
            id={id}
            onSaved={onSaved}
            setUniverse={setUniverse}
            universe={universe}
          />
        ) : null}
      </section>
    </main>
  )
}

function UniverseEditorForm({ id, onSaved, setUniverse, universe }) {
  const initialFriendlyArticle = useMemo(
    () => parseArticleSections(universe.description || ''),
    [universe.description],
  )
  const [name, setName] = useState(universe.name || '')
  const [description, setDescription] = useState(universe.description || '')
  const [friendlyArticle, setFriendlyArticle] = useState(initialFriendlyArticle)
  const [editorTab, setEditorTab] = useState('friendly')
  const [isPublic, setIsPublic] = useState(Boolean(universe.public))
  const [portraitFile, setPortraitFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [saveStatus, setSaveStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const friendlyDescription = useMemo(
    () => sectionsToHtml(friendlyArticle),
    [friendlyArticle],
  )
  const effectiveDescription =
    editorTab === 'friendly' ? friendlyDescription : description
  const preview = useMemo(
    () => sanitizeArticleHtml(effectiveDescription),
    [effectiveDescription],
  )
  const attachedImages = [
    universe.portrait_image
      ? { label: 'Portrait image', attachment: universe.portrait_image }
      : null,
    universe.cover_image
      ? { label: 'Cover image', attachment: universe.cover_image }
      : null,
    ...(universe.misc_images || []).map((attachment, index) => ({
      label: `Gallery image ${index + 1}`,
      attachment,
    })),
  ].filter(Boolean)

  const appendHtmlSnippet = (snippet) => {
    setEditorTab('html')
    setDescription((current) =>
      `${(editorTab === 'friendly' ? friendlyDescription : current).trim()}\n\n${snippet}`.trim(),
    )
  }

  const appendAttachedImage = (attachment) => {
    const src = attachmentUrl(attachment)
    if (!src) return

    appendHtmlSnippet(`<img src="${src}" alt="${attachment.filename || name}">`)
  }

  const switchEditorTab = (tab) => {
    if (tab === 'html' && editorTab === 'friendly') {
      setDescription(friendlyDescription)
    }

    if (tab === 'friendly' && editorTab === 'html') {
      setFriendlyArticle(parseArticleSections(description))
    }

    setEditorTab(tab)
  }

  const updateSection = (index, field, value) => {
    setFriendlyArticle((current) => ({
      ...current,
      sections: current.sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, [field]: value } : section,
      ),
    }))
  }

  const addSection = () => {
    setFriendlyArticle((current) => ({
      ...current,
      sections: [...current.sections, { body: '', title: 'New section' }],
    }))
  }

  const removeSection = (index) => {
    setFriendlyArticle((current) => ({
      ...current,
      sections:
        current.sections.length === 1
          ? [{ body: '', title: 'Overview' }]
          : current.sections.filter((_, sectionIndex) => sectionIndex !== index),
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaveStatus('loading')
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('universe[name]', name.trim())
      formData.append('universe[description]', effectiveDescription)
      formData.append('universe[public]', isPublic ? 'true' : 'false')
      if (portraitFile) formData.append('universe[portrait_image]', portraitFile)
      if (coverFile) formData.append('universe[cover_image]', coverFile)
      galleryFiles.forEach((file) => {
        formData.append('universe[misc_images][]', file)
      })

      const savedUniverse = await patchFormData(`/api/v1/universes/${id}`, formData)
      setUniverse(savedUniverse)
      setPortraitFile(null)
      setCoverFile(null)
      setGalleryFiles([])
      setSaveStatus('success')
      setMessage('Universe saved.')
      onSaved()
    } catch (saveError) {
      setSaveStatus('error')
      setMessage(saveError.message)
    }
  }

  return (
    <div className="edit-layout">
      <form className="wiki-editor-card" onSubmit={handleSave}>
        <label htmlFor="universe-name">Name</label>
        <input
          id="universe-name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <label className="checkbox-row" htmlFor="universe-public">
          <input
            id="universe-public"
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />
          Public universe
        </label>

        <fieldset className="image-upload-fieldset">
          <legend>Universe images</legend>
          <label htmlFor="universe-portrait">Portrait image</label>
          <input
            id="universe-portrait"
            accept="image/jpeg,image/png,image/webp,image/gif"
            type="file"
            onChange={(event) =>
              setPortraitFile(event.target.files?.[0] || null)
            }
          />
          <label htmlFor="universe-cover">Cover image</label>
          <input
            id="universe-cover"
            accept="image/jpeg,image/png,image/webp,image/gif"
            type="file"
            onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
          />
          <label htmlFor="universe-gallery">Gallery images</label>
          <input
            id="universe-gallery"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            type="file"
            onChange={(event) =>
              setGalleryFiles(Array.from(event.target.files || []))
            }
          />
          <p>
            Save after choosing files. Uploaded gallery images can be inserted
            into the article from the image library below.
          </p>
        </fieldset>

        <div className="editor-tabs" role="tablist" aria-label="Description editor">
          <button
            aria-selected={editorTab === 'friendly'}
            role="tab"
            type="button"
            onClick={() => switchEditorTab('friendly')}
          >
            Friendly editor
          </button>
          <button
            aria-selected={editorTab === 'html'}
            role="tab"
            type="button"
            onClick={() => switchEditorTab('html')}
          >
            HTML editor
          </button>
        </div>

        {editorTab === 'friendly' ? (
          <div className="friendly-editor-panel" role="tabpanel">
            <label htmlFor="friendly-intro">Introduction</label>
            <textarea
              id="friendly-intro"
              value={friendlyArticle.intro}
              onChange={(event) =>
                setFriendlyArticle((current) => ({
                  ...current,
                  intro: event.target.value,
                }))
              }
              placeholder="Write a short introduction for this universe."
            />

            <div className="friendly-section-header">
              <h3>Article sections</h3>
              <button type="button" onClick={addSection}>
                Add section
              </button>
            </div>

            {friendlyArticle.sections.map((section, index) => (
              <article className="friendly-section-editor" key={index}>
                <label htmlFor={`section-title-${index}`}>Section title</label>
                <input
                  id={`section-title-${index}`}
                  value={section.title}
                  onChange={(event) =>
                    updateSection(index, 'title', event.target.value)
                  }
                />
                <label htmlFor={`section-body-${index}`}>Section text</label>
                <textarea
                  id={`section-body-${index}`}
                  value={section.body}
                  onChange={(event) =>
                    updateSection(index, 'body', event.target.value)
                  }
                  placeholder="Write this section in plain text."
                />
                <button type="button" onClick={() => removeSection(index)}>
                  Remove section
                </button>
              </article>
            ))}

            <p className="editor-help">
              Write in plain text here. Each section title becomes a Contents
              link automatically on the article page.
            </p>
          </div>
        ) : (
          <div className="html-editor-panel" role="tabpanel">
            <label htmlFor="universe-description">Article HTML</label>
            <div className="snippet-toolbar" aria-label="Insert snippets">
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet('<h2>History</h2>\n<p>Write a new section...</p>')
                }
              >
                Heading
              </button>
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet(
                    '<img src="https://example.com/image.jpg" alt="Describe the image">',
                  )
                }
              >
                Image
              </button>
              <button
                type="button"
                onClick={() =>
                  appendHtmlSnippet('<blockquote>Important quote or lore note.</blockquote>')
                }
              >
                Quote
              </button>
            </div>
            <textarea
              id="universe-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="<h2>Overview</h2><p>Write your universe article here.</p>"
            />
            <p className="editor-help">
              Use HTML for structure: <code>&lt;h2&gt;</code> and{' '}
              <code>&lt;h3&gt;</code> become the Contents links automatically.
              External images work with{' '}
              <code>&lt;img src=&quot;https://...&quot; alt=&quot;...&quot;&gt;</code>.
              For uploaded images, save the files first, then use the Insert
              button in the image library.
            </p>
          </div>
        )}

        <button type="submit" disabled={saveStatus === 'loading'}>
          {saveStatus === 'loading' ? 'Saving...' : 'Save universe'}
        </button>
        {message ? (
          <p className={`form-message ${saveStatus}`}>{message}</p>
        ) : null}
      </form>

      <aside className="wiki-preview-card">
        <h2>Preview</h2>
        {attachedImages.length > 0 ? (
          <div className="attached-image-library">
            <h3>Image library</h3>
            <p>Insert an uploaded image into the article body.</p>
            <div>
              {attachedImages.map(({ attachment, label }) => (
                <article key={`${label}-${attachment.url}`}>
                  <img src={attachmentUrl(attachment)} alt="" />
                  <div>
                    <strong>{label}</strong>
                    <span>{attachment.filename}</span>
                    <button
                      type="button"
                      onClick={() => appendAttachedImage(attachment)}
                    >
                      Insert
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="attached-image-library empty">
            <h3>Image library</h3>
            <p>
              Upload and save images to create reusable article image snippets.
            </p>
          </div>
        )}
        <div
          className="wiki-body"
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      </aside>
    </div>
  )
}

export default App
