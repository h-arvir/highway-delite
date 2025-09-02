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
    const { data, error } = await supabase.from('notes').select('*').eq('user_id', user!.id).order('created_at', { ascending: false })
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
    <div style={{ maxWidth: 700, margin: '24px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Notes</h2>
          <div style={{ color: '#666', fontSize: 14 }}>Signed in as {user?.email}</div>
        </div>
        <button onClick={signOut}>Sign out</button>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 8, borderRadius: 6, marginBottom: 8 }}>
          {error}
        </div>
      )}

      <section style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <textarea
            placeholder="Write your note..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', resize: 'vertical' }}
          />
          <button onClick={createNote} disabled={loading}>
            {loading ? 'Saving...' : 'Add note'}
          </button>
        </div>
      </section>

      <ul style={{ display: 'grid', gap: 12 }}>
        {notes.map((n) => (
          <li key={n.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{n.title}</strong>
              <button onClick={() => deleteNote(n.id)} style={{ color: '#b91c1c' }}>
                Delete
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{n.content}</div>
            <div style={{ color: '#777', fontSize: 12, marginTop: 6 }}>{new Date(n.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}