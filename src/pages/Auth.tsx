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
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [phase, setPhase] = useState<'email' | 'otp'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const requestOtp = async () => {
    setError(null)
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError(parsed.error.errors[0]?.message ?? 'Invalid email')
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

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h2>Welcome</h2>
      <p>Sign up or login</p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {phase === 'email' ? (
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={requestOtp} disabled={loading} style={{ marginTop: 12, width: '100%' }}>
            {loading ? 'Sending...' : 'Continue with Email'}
          </button>
          <div style={{ textAlign: 'center', margin: '12px 0' }}>or</div>
          <button onClick={signInWithGoogle} disabled={loading} style={{ width: '100%' }}>
            Continue with Google
          </button>
        </div>
      ) : (
        <div>
          <label style={{ display: 'block', marginBottom: 8 }}>Enter 6-digit OTP sent to {email}</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', letterSpacing: 4 }}
          />
          <button onClick={verifyOtp} disabled={loading} style={{ marginTop: 12, width: '100%' }}>
            {loading ? 'Verifying...' : 'Verify & Sign in'}
          </button>
          <button onClick={() => setPhase('email')} style={{ marginTop: 8, width: '100%' }}>
            Use a different email
          </button>
        </div>
      )}
    </div>
  )
}