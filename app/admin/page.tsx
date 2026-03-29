'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// --- YOUR MASTER PASSWORD ---
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
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wordstory_admin_auth', 'true');
      fetchWords();
    } else {
      alert("Incorrect password!");
      setPasswordInput('');
    }
  };

  const fetchWords = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('words').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setWords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        const { data } = await supabase.from('words').select('*').ilike('word', `%${searchQuery}%`).limit(50);
        if (data) setWords(data);
      } else if (searchQuery.length === 0) {
        fetchWords();
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isAuthenticated]);

  const handleSave = async () => {
    setIsSaving(true);
    if (editingWord.id) {
      await supabase.from('words').update(editingWord).eq('id', editingWord.id);
    } else {
      await supabase.from('words').insert([editingWord]);
    }
    setIsSaving(false);
    setIsModalOpen(false);
    fetchWords();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this word forever?')) {
      await supabase.from('words').delete().eq('id', id);
      fetchWords();
    }
  };

  const openNewWordModal = () => {
    // Note: image_url is completely removed from the initial state
    setEditingWord({ 
      word: '', phonetic: '', meaning_en: '', meaning_hi: '', 
      example_en: '', example_hi: '', story_hi: '',
      synonyms: '', antonyms: '', word_family: '', collocations: ''
    });
    setIsModalOpen(true);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--app-bg)' }}>
        <div style={{ padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', textAlign: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 900, marginBottom: '8px', color: 'var(--text-main)' }}>WordStory Admin</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '32px' }}>Enter the master password.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="Password" 
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--hover-bg)', color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px', outline: 'none' }}
            />
            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="app-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', backgroundColor: 'var(--app-bg)', minHeight: '100vh' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: '24px', letterSpacing: '-0.03em', color: 'var(--text-main)', fontFamily: 'system-ui, sans-serif' }}>
            WORD<span style={{ color: 'var(--accent-text)' }}>STORY</span> <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 600 }}>ADMIN</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/" style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>View App</Link>
          <button onClick={openNewWordModal} style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add New Word</button>
        </div>
      </header>

      <input 
        type="text" 
        placeholder="Search database to edit..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: '100%', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '16px', marginBottom: '24px', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      />

      <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-light)', fontWeight: 500 }}>Loading database...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--hover-bg)' }}>
                <th style={{ padding: '20px 24px', color: 'var(--text-light)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Word</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-light)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meaning (EN)</th>
                <th style={{ padding: '20px 24px', color: 'var(--text-light)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {words.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '20px 24px', fontWeight: 800, color: 'var(--text-main)', fontSize: '18px' }}>{item.word}</td>
                  <td style={{ padding: '20px 24px', color: 'var(--text-light)', lineHeight: 1.5 }}>{item.meaning_en?.substring(0, 60)}...</td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button onClick={() => { setEditingWord(item); setIsModalOpen(true); }} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--app-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', marginRight: '8px', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT/ADD MODAL */}
      {isModalOpen && editingWord && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '32px', padding: '40px', border: '1px solid var(--border)', boxShadow: '0 30px 60px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'sticky', top: '-40px', background: 'var(--card-bg)', paddingBottom: '16px', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontWeight: 900, color: 'var(--text-main)' }}>{editingWord.id ? 'Edit Word' : 'Add New Word'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'var(--hover-bg)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 'bold' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Core Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vocabulary Word</label>
                  <input type="text" value={editingWord.word || ''} onChange={e => setEditingWord({...editingWord, word: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', fontSize: '16px', fontWeight: 600, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phonetic</label>
                  <input type="text" value={editingWord.phonetic || ''} onChange={e => setEditingWord({...editingWord, phonetic: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', fontSize: '16px', outline: 'none' }} />
                </div>
              </div>

              {/* Meanings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meaning (English)</label>
                  <textarea value={editingWord.meaning_en || ''} onChange={e => setEditingWord({...editingWord, meaning_en: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', minHeight: '100px', fontSize: '15px', lineHeight: 1.5, outline: 'none', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meaning (Hindi)</label>
                  <textarea value={editingWord.meaning_hi || ''} onChange={e => setEditingWord({...editingWord, meaning_hi: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', minHeight: '100px', fontSize: '15px', lineHeight: 1.5, outline: 'none', resize: 'vertical' }} />
                </div>
              </div>

              {/* Examples */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example (English)</label>
                  <textarea value={editingWord.example_en || ''} onChange={e => setEditingWord({...editingWord, example_en: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', minHeight: '100px', fontSize: '15px', lineHeight: 1.5, outline: 'none', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Example (Hindi)</label>
                  <textarea value={editingWord.example_hi || ''} onChange={e => setEditingWord({...editingWord, example_hi: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', minHeight: '100px', fontSize: '15px', lineHeight: 1.5, outline: 'none', resize: 'vertical' }} />
                </div>
              </div>

              {/* Story */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Word Story (Hindi with English bolded)</label>
                <textarea value={editingWord.story_hi || ''} onChange={e => setEditingWord({...editingWord, story_hi: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', minHeight: '120px', fontSize: '16px', lineHeight: 1.6, outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border) 50%, transparent)', margin: '16px 0' }}></div>

              {/* Word Relations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Synonyms (comma separated)</label>
                  <input type="text" placeholder="e.g. bold, brave" value={editingWord.synonyms || ''} onChange={e => setEditingWord({...editingWord, synonyms: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Antonyms (comma separated)</label>
                  <input type="text" placeholder="e.g. cowardly, timid" value={editingWord.antonyms || ''} onChange={e => setEditingWord({...editingWord, antonyms: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Word Family (comma separated)</label>
                  <input type="text" placeholder="e.g. boldly, boldness" value={editingWord.word_family || ''} onChange={e => setEditingWord({...editingWord, word_family: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: 'var(--text-light)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collocations (comma separated)</label>
                  <input type="text" placeholder="e.g. bold move" value={editingWord.collocations || ''} onChange={e => setEditingWord({...editingWord, collocations: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--app-bg)', color: 'var(--text-main)', outline: 'none' }} />
                </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={isSaving}
                style={{ width: '100%', padding: '20px', borderRadius: '16px', backgroundColor: 'var(--accent-text)', color: '#fff', border: 'none', fontWeight: 800, fontSize: '18px', cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '16px', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)' }}
              >
                {isSaving ? 'Saving...' : 'Save Word to Database'}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}