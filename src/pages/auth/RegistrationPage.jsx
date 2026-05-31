
import { useMemo, useState } from 'react'
import characterMockup from '../../assets/wiki-character-mockup.svg'
import { postJson } from '../../concerns/api'
import { storeSession } from '../../concerns/session'

const MIN_PASSWORD_LENGTH = 10

// Renders signup, validates password confirmation, then signs the new user in automatically.
export function RegistrationPage({
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
      password.length >= MIN_PASSWORD_LENGTH &&
      password === passwordConfirmation &&
      status !== 'loading',
    [email, password, passwordConfirmation, status],
  )

  // Creates the account first, then logs in with the same credentials to receive a token.
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
            minLength={MIN_PASSWORD_LENGTH}
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
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />

          {passwordConfirmation && password !== passwordConfirmation ? (
            <p className="form-hint error">Passwords do not match yet.</p>
          ) : (
            <p className="form-hint">
              Use at least {MIN_PASSWORD_LENGTH} characters.
            </p>
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
