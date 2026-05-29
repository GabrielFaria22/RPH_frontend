
import { useState } from 'react'
import universeMockup from '../../assets/wiki-universe-mockup.svg'
import { postJson } from '../../concerns/api'
import { storeSession } from '../../concerns/session'

export function LoginPage({ initialEmail, onAuthenticated, onBackHome, onGoRegister }) {
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
