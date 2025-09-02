import { useEffect, useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Notes</h2>
            <div style={{ color: '#6b7280', fontSize: 14 }}>Signed in as {user?.email}</div>
          </div>
          <button className="button secondary" onClick={signOut}>Sign out</button>
        </header>

        {error && (
          <div className="error" style={{ marginBottom: 12 }}>{error}</div>
        )}

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

        <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
          {notes.map((n) => (
            <li key={n.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{n.title}</strong>
                <button className="button secondary" onClick={() => deleteNote(n.id)} style={{ color: '#b91c1c' }}>
                  Delete
                </button>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{n.content}</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>{new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}