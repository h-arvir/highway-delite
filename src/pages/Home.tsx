import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 chars'),
  content: z.string().min(1, 'Content is required').max(2000, 'Max 2000 chars'),
})

type Note = { id: string; title: string; content: string; user_id: string; created_at: string }

export default function HomePage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showComposer, setShowComposer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const displayName = useMemo(() => {
    const meta: any = user?.user_metadata ?? {}
    return meta.full_name || meta.name || (user?.email ? user.email.split('@')[0] : 'there')
  }, [user])

  useEffect(() => {
    if (!user) return
    void fetchNotes()
  }, [user])

  const fetchNotes = async () => {
    setError(null)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (error) return setError(error.message)
    setNotes((data as Note[]) ?? [])
  }

  const createNote = async () => {
    setError(null)
    const parsed = noteSchema.safeParse({ title, content })
    if (!parsed.success) return setError(parsed.error.errors[0]?.message ?? 'Invalid input')

    setLoading(true)
    const { error } = await supabase.from('notes').insert({ title, content, user_id: user!.id })
    setLoading(false)
    if (error) return setError(error.message)
    setTitle('')
    setContent('')
    await fetchNotes()
    setShowComposer(false)
  }

  const deleteNote = async (id: string) => {
    setError(null)
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user!.id)
    if (error) return setError(error.message)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="page">
      <div className="container">
        {/* Top Navigation Bar */}
        <nav className="topbar">
          <div className="brand">
            <div className="logo-circle small" aria-hidden />
            <span className="nav-title">Dashboard</span>
          </div>
          <button className="link-button" onClick={signOut}>Sign Out</button>
        </nav>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

        {/* Welcome Card */}
        <section className="card welcome-card">
          <div className="welcome-heading">Welcome, {displayName}!</div>
          <div className="welcome-subtext">Email: {user?.email}</div>
        </section>

        {/* Primary Action */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button className="button primary wide" style={{ maxWidth: 420 }} onClick={() => setShowComposer((s) => !s)}>
            Create Note
          </button>
        </div>

        {/* Note Composer (toggle) */}
        {showComposer && (
          <section className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <input
                className="input rounded"
                type="text"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="input rounded"
                placeholder="Write your note..."
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <button className="button primary" onClick={createNote} disabled={loading}>
                {loading ? 'Saving...' : 'Add note'}
              </button>
            </div>
          </section>
        )}

        {/* Notes Section */}
        <h3 className="section-heading">Notes</h3>
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id} className="card note-item">
              <div className="note-row">
                <strong>{n.title}</strong>
                <button className="icon-button" onClick={() => deleteNote(n.id)} title="Delete note" aria-label="Delete note">
                  🗑️
                </button>
              </div>
              <div className="note-content">{n.content}</div>
              <div className="note-meta">{new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}