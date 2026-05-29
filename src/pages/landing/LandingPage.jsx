
import { useState } from 'react'
import characterMockup from '../../assets/wiki-character-mockup.svg'
import heroMockup from '../../assets/wiki-hero-mockup.svg'
import universeMockup from '../../assets/wiki-universe-mockup.svg'

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

export function LandingPage({ onLogin, onRegister }) {
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
