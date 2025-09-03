import { useState } from 'react'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

const emailSchema = z.string().email('Enter a valid email')
const otpSchema = z
  .string()
  .min(6, 'OTP must be 6 digits')
  .max(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/g, 'OTP must be numeric')

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpVisible, setOtpVisible] = useState(false)
  const [otpRequested, setOtpRequested] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestOtp = async () => {
    setError(null)
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Invalid email')

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: undefined },
    })
    setLoading(false)
    if (error) return setError(error.message)
    setOtpRequested(true)
  }

  const verifyOtp = async () => {
    setError(null)
    const parsedEmail = emailSchema.safeParse(email)
    if (!parsedEmail.success) return setError(parsedEmail.error.issues[0]?.message ?? 'Invalid email')
    const parsedOtp = otpSchema.safeParse(otp)
    if (!parsedOtp.success) return setError(parsedOtp.error.issues[0]?.message ?? 'Invalid OTP')

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (error) return setError(error.message)
    // On success, supabase sets session; router will redirect from App
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="signup-card">
          <div className="signup-header">
            <div className="logo-circle" aria-hidden />
            <div className="app-name">HD</div>
            <h1 className="title">Sign in</h1>
            <p className="subtitle">Welcome back to HD</p>
          </div>

          {error && (
            <div className="error" role="alert" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input rounded"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            {otpRequested && (
              <>
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
                    {otpVisible ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
              </>
            )}

            <button
              className="button primary wide"
              onClick={otpRequested ? verifyOtp : requestOtp}
              disabled={loading}
            >
              {loading
                ? (otpRequested ? 'Verifying…' : 'Sending…')
                : (otpRequested ? 'Verify & Sign in' : 'Send OTP')}
            </button>

            <div className="footer-text">
              <span>New here? </span>
              <Link className="link" to="/auth">Create account</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right" aria-hidden>
        <div className="hero-image" />
      </div>
    </div>
  )
}