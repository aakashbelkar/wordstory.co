'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const MASTER_PASSWORD = "wordstory_admin"; 

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [words, setWords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('wordstory_admin_auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
      fetchWords();
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wordstory_admin_auth', 'true');
      fetchWords();
    } else { alert("Incorrect password!"); setPasswordInput(''); }
  };

  const fetchWords = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('words').select('*').order('word', { ascending: true }).limit(100);
    if (data) setWords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        const { data } = await supabase.from('words').select('*').ilike('word', `%${searchQuery}%`).limit(50);
        if (data) setWords(data);
      } else if (searchQuery.length === 0) fetchWords();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isAuthenticated]);

  const handleSave = async () => {
    if (!editingWord.word) return alert("Word is required!");
    setIsSaving(true);
    const { error } = editingWord.id 
      ? await supabase.from('words').update(editingWord).eq('id', editingWord.id)
      : await supabase.from('words').insert([editingWord]);
    if (error) alert(error.message);
    else { setIsModalOpen(false); fetchWords(); }
    setIsSaving(false);
  };

  const openNewWordModal = () => {
    setEditingWord({ word: '', phonetic: '', meaning_en: '', meaning_hi: '', example_en: '', example_hi: '', story_hi: '', synonyms: '', antonyms: '', word_family: '', collocations: '' });
    setIsModalOpen(true);
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--app-bg)', 
      minHeight: '100vh', // Allows page to grow
      width: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: 'var(--text-main)',
      paddingBottom: '100px' // Space at the bottom
    }}>
      
      <style>{`
        :root {
          --accent-text: #10b981;
          --app-bg: #f8fafc;
          --text-main: #0f172a;
          --text-light: #64748b;
          --border: rgba(0,0,0,0.1);
          --card-bg: #ffffff;
        }
        [data-theme='dark'] {
          --app-bg: #020617;
          --text-main: #f8fafc;
          --text-light: #94a3b8;
          --border: rgba(255,255,255,0.1);
          --card-bg: #0f172a;
        }

        /* MODAL FIX: The overlay is now the scrollable part */
        .admin-modal-overlay {
          position: fixed; 
          inset: 0; 
          background: rgba(0,0,0,0.7); 
          backdrop-filter: blur(8px); 
          z-index: 9999; 
          overflow-y: auto; /* ALLOWS SCROLLING */
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }

        .admin-modal-content {
          background-color: var(--card-bg) !important;
          width: 100%; 
          maxWidth: 800px; 
          height: fit-content; /* Grows with content */
          border-radius: 32px; 
          padding: 40px; 
          border: 1px solid var(--border);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          margin-bottom: 40px;
        }

        input, textarea {
          width: 100%; padding: 16px; border-radius: 12px; 
          border: 1px solid var(--border); background: var(--app-bg); 
          color: var(--text-main); font-size: 16px; outline: none; margin-top: 6px;
        }
        label { font-size: 12px; fontWeight: 800; color: var(--accent-text); text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>

      {!isAuthenticated ? (
        <div style={{ marginTop: '100px', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <h2 style={{ fontWeight: 900, marginBottom: '24px' }}>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" style={{ marginBottom: '16px' }} />
            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Unlock Dashboard</button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '1000px', width: '100%', padding: '40px 24px' }}>
          
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>WORD<span style={{ color: 'var(--accent-text)' }}>STORY</span> <span style={{ opacity: 0.5 }}>ADMIN</span></h1>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href="/" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>View App</Link>
              <button onClick={openNewWordModal} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add Word</button>
            </div>
          </header>

          <input type="text" placeholder="Search database..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ marginBottom: '24px' }} />

          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {isLoading ? <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase' }}>Word</th>
                    <th style={{ padding: '20px 24px', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '20px 24px', fontWeight: 800 }}>{item.word}</td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button onClick={() => { setEditingWord(item); setIsModalOpen(true); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'none', color: 'var(--text-main)', cursor: 'pointer', marginRight: '8px', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => { if(window.confirm('Delete?')) supabase.from('words').delete().eq('id', item.id).then(()=>fetchWords()) }} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* EDIT/ADD MODAL (Now Fully Scrollable) */}
      {isModalOpen && editingWord && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0, fontWeight: 900 }}>{editingWord.id ? 'Edit Word' : 'New Word'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label>Word</label><input type="text" value={editingWord.word || ''} onChange={e => setEditingWord({...editingWord, word: e.target.value})} /></div>
                <div><label>Phonetic</label><input type="text" value={editingWord.phonetic || ''} onChange={e => setEditingWord({...editingWord, phonetic: e.target.value})} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label>Meaning (EN)</label><textarea value={editingWord.meaning_en || ''} onChange={e => setEditingWord({...editingWord, meaning_en: e.target.value})} /></div>
                <div><label>Meaning (HI)</label><textarea value={editingWord.meaning_hi || ''} onChange={e => setEditingWord({...editingWord, meaning_hi: e.target.value})} /></div>
              </div>

              <div><label>Story (HI)</label><textarea style={{ minHeight: '120px' }} value={editingWord.story_hi || ''} onChange={e => setEditingWord({...editingWord, story_hi: e.target.value})} /></div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><label>Synonyms</label><input type="text" value={editingWord.synonyms || ''} onChange={e => setEditingWord({...editingWord, synonyms: e.target.value})} /></div>
                <div><label>Antonyms</label><input type="text" value={editingWord.antonyms || ''} onChange={e => setEditingWord({...editingWord, antonyms: e.target.value})} /></div>
                <div><label>Word Family</label><input type="text" value={editingWord.word_family || ''} onChange={e => setEditingWord({...editingWord, word_family: e.target.value})} /></div>
                <div><label>Collocations</label><input type="text" value={editingWord.collocations || ''} onChange={e => setEditingWord({...editingWord, collocations: e.target.value})} /></div>
              </div>

              <button onClick={handleSave} disabled={isSaving} style={{ width: '100%', padding: '20px', borderRadius: '16px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '18px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                {isSaving ? 'Saving...' : 'Save to WordStory Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}