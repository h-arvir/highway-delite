import { useState } from 'react'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'

const emailSchema = z.string().email('Enter a valid email')
const otpSchema = z
  .string()
  .min(6, 'OTP must be 6 digits')
  .max(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/g, 'OTP must be numeric')

export default function AuthPage() {
  // UI fields per ui.md
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')

  // Auth state
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpVisible, setOtpVisible] = useState(false)
  const [phase, setPhase] = useState<'email' | 'otp'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestOtp = async () => {
    setError(null)
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.errors[0]?.message ?? 'Invalid email')

    // NOTE: Name & DOB are collected here per UI, but not yet persisted.
    // You can store them to your profile table after successful sign-in.

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: undefined },
    })
    setLoading(false)
    if (error) return setError(error.message)
    setPhase('otp')
  }

  const verifyOtp = async () => {
    setError(null)
    const parsedEmail = emailSchema.safeParse(email)
    if (!parsedEmail.success) return setError(parsedEmail.error.errors[0]?.message ?? 'Invalid email')
    const parsedOtp = otpSchema.safeParse(otp)
    if (!parsedOtp.success) return setError(parsedOtp.error.errors[0]?.message ?? 'Invalid OTP')

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (error) return setError(error.message)
    // On success, supabase sets session; router will redirect from App
  }

  const signInLink = (
    <div className="footer-text">
      <span>Already have an account? </span>
      <a className="link" href="#" onClick={(e) => { e.preventDefault(); setPhase('email') }}>Sign in</a>
    </div>
  )

  return (
    <div className="auth-layout">
      {/* Left: Sign up form (always visible) */}
      <div className="auth-left">
        <div className="signup-card">
          <div className="signup-header">
            <div className="logo-circle" aria-hidden />
            <div className="app-name">HD</div>
            <h1 className="title">Sign up</h1>
            <p className="subtitle">Sign up to enjoy the feature of HD</p>
          </div>

          {error && (
            <div className="error" role="alert" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          {phase === 'email' ? (
            <div>
              <label className="field-label" htmlFor="name">Your Name</label>
              <input
                id="name"
                className="input rounded"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />

              <label className="field-label" htmlFor="dob">Date of Birth</label>
              <div className="input-with-icon">
                 
                <input
                  id="dob"
                  className="input rounded with-icon"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="Date of Birth"
                />
              </div>

              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input rounded"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <button className="button primary wide" onClick={requestOtp} disabled={loading}>
                {loading ? 'Sending…' : 'Sign up'}
              </button>

              {signInLink}
            </div>
          ) : (
            <div>
              <label className="field-label" htmlFor="otp">OTP</label>
              <div className="otp-wrapper active">
                <input
                  id="otp"
                  className="input rounded otp-input"
                  type={otpVisible ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  aria-label="Enter 6-digit OTP"
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={otpVisible ? 'Hide OTP' : 'Show OTP'}
                  onClick={() => setOtpVisible((v) => !v)}
                >
                  {otpVisible ? '🙈' : '👁️'}
                </button>
              </div>

              <button className="button primary wide" onClick={verifyOtp} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Sign in'}
              </button>
              <button className="button secondary wide" onClick={() => setPhase('email')}>
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Big picture (desktop only) */}
      <div className="auth-right" aria-hidden>
        <div className="hero-image" />
      </div>
    </div>
  )
}