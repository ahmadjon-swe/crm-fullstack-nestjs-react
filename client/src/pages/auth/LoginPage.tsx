import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/api/services'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import './LoginPage.css'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const language = useUIStore((s) => s.language)
  const setLanguage = useUIStore((s) => s.setLanguage)

  const [step, setStep] = useState<Step>('credentials')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.login(login, password)
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verify(login, otp)
      const { data: admin, tokens } = res.data
      setAuth(admin as any, tokens)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-grid" />
      </div>

      {/* Top bar */}
      <div className="login-topbar">
        <div className="login-logo">
          <span className="login-logo-icon">🎓</span>
          <span className="login-logo-text">Education CRM</span>
        </div>
        <div className="login-topbar-actions">
          <div className="lang-selector">
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                className={`lang-btn ${language === l ? 'active' : ''}`}
                onClick={() => setLanguage(l)}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="login-card-wrap">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-avatar">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="var(--brand-500)" opacity="0.12"/>
                <path d="M20 12a4 4 0 100 8 4 4 0 000-8zm0 10c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" fill="var(--brand-500)"/>
              </svg>
            </div>
            <h1 className="login-title">{t('loginTitle')}</h1>
            <p className="login-subtitle">
              {step === 'credentials' ? t('loginSubtitle') : t('otpSubtitle')}
            </p>
          </div>

          {/* Step indicator */}
          <div className="login-steps">
            <div className={`login-step ${step === 'credentials' ? 'active' : 'done'}`}>
              <span className="step-num">{step === 'credentials' ? '1' : '✓'}</span>
              <span className="step-label">{t('login')}</span>
            </div>
            <div className="step-line" />
            <div className={`login-step ${step === 'otp' ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">{t('verify')}</span>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">{t('username')}</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path d="M10 2a4 4 0 100 8 4 4 0 000-8zm0 10c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="admin yoki email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('password')}</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-suffix"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    {t('login')}
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="login-form">
              <div className="otp-info">
                <span className="otp-icon">📧</span>
                <p>{t('otpSent')} <strong>{login}</strong></p>
              </div>
              <div className="form-group">
                <label className="form-label">{t('enterOtp')}</label>
                <input
                  type="text"
                  className="form-input otp-input"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  inputMode="numeric"
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading || otp.length !== 6}>
                {loading ? <span className="spinner" /> : t('verify')}
              </button>

              <button
                type="button"
                className="btn-back"
                onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
              >
                ← {t('back') || 'Orqaga'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
