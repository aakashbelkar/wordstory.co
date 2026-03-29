'use client'
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

// --- ICONS ---
const IconEn = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconHi = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconPen = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>;
const IconLink = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;
const IconBook = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconBrain = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3c-1.27 0-2.4.8-2.82 2H8.5C6.57 5 5 6.57 5 8.5c0 1.25.65 2.36 1.63 3C6.22 12 6 12.51 6 13.04C6 15.22 7.78 17 9.96 17H10v2h4v-2h.04C16.22 17 18 15.22 18 13.04c0-.53-.22-1.04-.63-1.54C18.35 10.86 19 9.75 19 8.5 19 6.57 17.43 5 15.5 5h-.68C14.4 3.8 13.27 3 12 3zm0 2c.55 0 1 .45 1 1v1h1.5c1.1 0 2 .9 2 2 0 1.1-.9 2-2 2h-1v1.51c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2V11H7.5c-1.1 0-2-.9-2-2 0-1.1.9-2 2-2H9V6c0-.55.45-1 1-1h2z"/></svg>;
const IconBookmarkOutline = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>;

interface WordClientProps {
  currentItem: any;
  prevWord: string | null;
  nextWord: string | null;
  totalCount: number;
  currentIndex: number;
}

const parseTags = (tagData: any) => {
  if (!tagData) return [];
  if (Array.isArray(tagData)) return tagData;
  if (typeof tagData === 'string') {
    return tagData.split(',').map(tag => tag.trim()).filter(Boolean); 
  }
  return [];
};

export default function WordClient({ currentItem, prevWord, nextWord, totalCount, currentIndex }: WordClientProps) {
  const router = useRouter();
  const params = useParams();
  const currentUrlWord = params.word as string;
  
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const flashcardRef = useRef<HTMLDivElement>(null);

  const [isRevealed, setIsRevealed] = useState(false);
  const [studyMode, setStudyMode] = useState(true);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  useEffect(() => {
    const savedStudyMode = localStorage.getItem('studyMode');
    if (savedStudyMode !== null) setStudyMode(savedStudyMode === 'true');

    const savedBookmarks = localStorage.getItem('wordstory_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  useEffect(() => {
    if (studyMode) {
      setIsRevealed(false);
    } else {
      setIsRevealed(true);
    }
  }, [currentItem.word, studyMode]);

  const toggleStudyMode = () => {
    triggerHaptic();
    const newMode = !studyMode;
    setStudyMode(newMode);
    localStorage.setItem('studyMode', String(newMode));
    if (!newMode) setIsRevealed(true);
    if (newMode) setIsRevealed(false);
  };

  const toggleBookmark = () => {
    triggerHaptic();
    const word = currentItem.word;
    let newBookmarks;
    if (bookmarks.includes(word)) {
      newBookmarks = bookmarks.filter(b => b !== word);
    } else {
      if (bookmarks.length >= 100) {
        alert("Bookmark limit reached (100). Clear some words to add more!");
        return;
      }
      newBookmarks = [...bookmarks, word];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('wordstory_bookmarks', JSON.stringify(newBookmarks));
  };

  const clearBookmarks = () => {
    if (window.confirm("Are you sure you want to clear all your saved words?")) {
      setBookmarks([]);
      localStorage.removeItem('wordstory_bookmarks');
    }
  };

  const safeSynonyms = parseTags(currentItem.synonyms);
  const safeAntonyms = parseTags(currentItem.antonyms);
  const safeWordFamily = parseTags(currentItem.word_family);
  const safeCollocations = parseTags(currentItem.collocations);
  const hasRelations = safeSynonyms.length > 0 || safeAntonyms.length > 0 || safeWordFamily.length > 0 || safeCollocations.length > 0;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    triggerHaptic();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15); 
    }
  };

  const playAudio = (word: string) => {
    triggerHaptic();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 0) {
        const { data } = await supabase.from('words').select('*').ilike('word', `%${searchQuery}%`).limit(5);
        if (data) setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectSearchResult = (wordText: string) => {
    triggerHaptic();
    setSearchQuery('');
    setSearchResults([]);
    navigateTo(wordText);
  };

  const navigateTo = (word: string | null) => {
    if (!word) return;
    
    // FIX: If we are already on this word, just close the bookmark modal and return
    if (word.toLowerCase() === currentUrlWord?.toLowerCase()) {
      setIsBookmarksOpen(false);
      return;
    }

    triggerHaptic();
    if (flashcardRef.current) {
      flashcardRef.current.style.transform = 'translateY(10px)';
      flashcardRef.current.style.opacity = '0';
    }
    setTimeout(() => {
      setIsBookmarksOpen(false);
      router.push(`/word/${word.toLowerCase()}`);
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') navigateTo(nextWord);
      if (e.key === 'ArrowLeft') navigateTo(prevWord);
      if (e.key === ' ' && studyMode && !isRevealed) {
        e.preventDefault();
        setIsRevealed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWord, prevWord, isRevealed, studyMode, currentUrlWord]);

  let touchStartX = 0; let touchEndX = 0;
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) navigateTo(nextWord);
    if (touchEndX - touchStartX > 50) navigateTo(prevWord);
  };

  const handleJumpToCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val >= 1 && val <= totalCount) {
      triggerHaptic();
      const { data } = await supabase.from('words').select('word').order('word', { ascending: true }).range(val - 1, val - 1).single();
      if (data) navigateTo(data.word);
    }
  };

  return (
    <div className="app-container" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      
      <style>{`
        :root {
          --accent-rgb: 16, 185, 129;
          --accent-text: #10b981; 
          --app-bg: #f8fafc;
          --text-main: #0f172a;
          --text-light: #64748b;
          --border: rgba(0,0,0,0.06);
          --hover-bg: #ffffff;
          --card-bg: #ffffff;
        }

        [data-theme='dark'] {
          --app-bg: #020617;
          --text-main: #f8fafc;
          --text-light: #94a3b8;
          --border: rgba(255,255,255,0.08);
          --hover-bg: #0f172a;
          --card-bg: #0f172a;
        }

        .bg-glow-1 { position: fixed; top: -10vw; left: -10vw; width: 40vw; height: 40vw; background: radial-gradient(circle, var(--accent-text) 0%, transparent 60%); opacity: 0.05; z-index: -1; pointer-events: none; border-radius: 50%; }
        .bg-glow-2 { position: fixed; bottom: -10vw; right: -10vw; width: 50vw; height: 50vw; background: radial-gradient(circle, #3b82f6 0%, transparent 60%); opacity: 0.04; z-index: -1; pointer-events: none; border-radius: 50%; }

        @keyframes subtlePulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(var(--accent-rgb), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
        }
        .reveal-btn {
          animation: subtlePulse 2s infinite;
          background: linear-gradient(135deg, var(--accent-text) 0%, #34d399 100%) !important;
        }
        .blurred-teaser {
          max-height: 180px;
          overflow: hidden;
          filter: blur(8px);
          opacity: 0.5;
          pointer-events: none;
          user-select: none;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .revealed-content {
          max-height: 5000px;
          filter: blur(0px);
          opacity: 1;
          pointer-events: auto;
          mask-image: none;
          -webkit-mask-image: none;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .study-mode-btn { transition: all 0.2s ease; }
        .study-mode-btn.active {
          background: linear-gradient(135deg, var(--accent-text) 0%, #34d399 100%);
          color: white;
          border-color: transparent;
        }
        
        .desktop-centered {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .word-masthead {
          font-family: 'SF Pro Display', -apple-system, system-ui, sans-serif;
          font-size: clamp(48px, 12vw, 80px);
          font-weight: 900; 
          letter-spacing: -0.04em;
          line-height: 1.1;
          background: linear-gradient(to bottom, var(--text-main) 30%, var(--text-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 8px 0;
        }

        .bookmark-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-action-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 1px solid var(--border);
          cursor: pointer;
          background: var(--card-bg);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .hero-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .hero-action-btn.bookmarked {
          background: var(--accent-text);
          color: #fff;
          border-color: var(--accent-text);
          box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.3);
        }
      `}</style>

      {/* Ambient Orbs */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* --- INFO MODAL --- */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'var(--app-bg)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={() => { triggerHaptic(); setIsModalOpen(false); }}>&times;</button>
          <h3 className="modal-title">How to use WordStory</h3>
          <ul className="modal-list">
            <li><strong>Swipe or use arrow keys</strong> to navigate through the deck.</li>
            <li><strong>Toggle Study Mode</strong> (the brain icon) to test your memory.</li>
            <li><strong>Save Words</strong> (bookmark icon) to review later (Max 100).</li>
            <li><strong>Tap Spacebar</strong> to reveal the word meaning.</li>
          </ul>
        </div>
      </div>

      {/* --- BOOKMARKS MODAL --- */}
      <div className={`modal-overlay ${isBookmarksOpen ? 'active' : ''}`} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setIsBookmarksOpen(false)}>
        <div className="modal-content" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'var(--app-bg)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflowY: 'auto', width: '90%', maxWidth: '450px', margin: 'auto', borderRadius: '24px', padding: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button className="close-modal" style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }} onClick={() => { triggerHaptic(); setIsBookmarksOpen(false); }}>&times;</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', paddingRight: '32px' }}>
            <h3 className="modal-title" style={{ margin: 0, fontSize: '20px' }}>Saved Words ({bookmarks.length}/100)</h3>
            {bookmarks.length > 0 && (
              <button onClick={clearBookmarks} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Clear All</button>
            )}
          </div>
          {bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ opacity: 0.3, marginBottom: '16px' }}><IconBookmarkOutline /></div>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-main)' }}>No saved words.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {bookmarks.map((word) => (
                <button key={word} onClick={() => navigateTo(word)} style={{ width: '100%', padding: '16px', textAlign: 'left', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', transition: 'background 0.2s ease' }}>{word}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="desktop-centered">
        <header className="px-dynamic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', paddingBottom: '16px', position: 'sticky', top: 0, zIndex: 1000, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', backgroundColor: theme === 'dark' ? 'rgba(18, 18, 18, 0.75)' : 'rgba(255, 255, 255, 0.75)', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'}`, boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', letterSpacing: '-0.03em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--text-main)' }}>WORD</span>
              <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--accent-text)', marginLeft: '1px' }}>STORY</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-light)', marginLeft: '4px', opacity: 0.6 }}>.co</span>
            </h1>
          </Link>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-btn" onClick={() => { triggerHaptic(); setIsBookmarksOpen(true); }} style={{ position: 'relative' }}>
              <IconBookmarkOutline />
              {bookmarks.length > 0 && <span className="bookmark-count">{bookmarks.length}</span>}
            </button>
            <button className={`icon-btn study-mode-btn ${studyMode ? 'active' : ''}`} onClick={toggleStudyMode}><IconBrain /></button>
            <button className="icon-btn" onClick={() => { triggerHaptic(); setIsModalOpen(true); }}>
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </button>
            <button className="icon-btn" onClick={toggleTheme}><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></button>
          </div>
        </header>

        <div className="search-wrapper px-dynamic">
          <div className="search-input-container">
            <input type="text" id="searchInput" placeholder="Search..." autoComplete="off" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button id="clearBtn" onClick={() => { triggerHaptic(); setSearchQuery(''); setSearchResults([]); }}>&times;</button>}
          </div>
          {searchResults.length > 0 && (
            <ul className="autocomplete-dropdown" style={{ display: 'block', backdropFilter: 'blur(16px)', backgroundColor: theme === 'dark' ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)' }}>
              {searchResults.map((result) => (
                <li key={result.id} className="autocomplete-item" onClick={() => selectSearchResult(result.word)}>
                  <span className="auto-word">{result.word}</span>
                  <span className="auto-meaning">{result.meaning_en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="nav-controls px-dynamic">
          {/* PREVIOUS BUTTON */}
          <button 
            onClick={() => navigateTo(prevWord)} 
            className="nav-btn" 
            style={{ opacity: prevWord ? 1 : 0.2, cursor: prevWord ? 'pointer' : 'default' }}
          >
            <span style={{ fontSize: '16px' }}>&larr;</span>
            <span className="nav-text-span">{prevWord || 'Prev'}</span>
          </button>
          
          {/* CENTER PROGRESS */}
          <div className="progress-container">
            <input 
  type="number" 
  className="progress-input" 
  value={currentIndex + 1} 
  onChange={handleJumpToCard}
  onFocus={(e) => e.target.select()}
  inputMode="numeric" // Forces numeric keypad on iPhone/Android
  min="1"
  max={totalCount}
/>
            <span>/ {totalCount}</span>
          </div>
          
          {/* NEXT BUTTON */}
          <button 
            onClick={() => navigateTo(nextWord)} 
            className="nav-btn" 
            style={{ 
              opacity: nextWord ? 1 : 0.3, 
              cursor: nextWord ? 'pointer' : 'default',
              justifyContent: 'flex-end' 
            }}
          >
            <span className="nav-text-span">{nextWord || 'Next'}</span>
            <span style={{ fontSize: '16px' }}>&rarr;</span>
          </button>
        </div>

        <div className="flashcard-container px-dynamic" id="flashcardArea" ref={flashcardRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '40px 0 60px 0' }}>
            <h2 className="word-masthead">{currentItem.word}</h2>
            <p style={{ fontSize: '20px', color: 'var(--text-light)', fontWeight: 500, letterSpacing: '0.02em', margin: '0 0 32px 0' }}>{currentItem.phonetic}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={toggleBookmark} className={`hero-action-btn ${bookmarks.includes(currentItem.word) ? 'bookmarked' : ''}`}>
                <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', stroke: 'currentColor', fill: bookmarks.includes(currentItem.word) ? 'currentColor' : 'none', strokeWidth: bookmarks.includes(currentItem.word) ? '0' : '2' }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <button onClick={() => playAudio(currentItem.word)} className="hero-action-btn"><svg viewBox="0 0 24 24" style={{ width: '26px', height: '26px', fill: 'currentColor' }}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {(studyMode && !isRevealed) && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '20px', zIndex: 10 }}>
                <button className="reveal-btn" onClick={() => { triggerHaptic(); setIsRevealed(true); }} style={{ color: '#fff', padding: '16px 32px', borderRadius: '999px', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM18 20H6V10h12v10z"/></svg>Tap to Unlock
                </button>
              </div>
            )}
            <div className={(!studyMode || isRevealed) ? 'revealed-content' : 'blurred-teaser'}>
              {currentItem.story_hi && (
                <div className="content-section" style={{ marginBottom: '40px' }}>
                  <div className="section-header" style={{ color: 'var(--accent-text)', fontSize: '18px', fontWeight: 700 }}><IconBook /> The Word Story</div>
                  <div style={{ padding: '24px', backgroundColor: 'var(--app-bg)', border: '1px solid var(--border)', borderRadius: '16px', marginTop: '12px', background: 'linear-gradient(180deg, var(--hover-bg) 0%, transparent 100%)' }}>
                    <p className="content-text hindi" style={{ fontSize: '17px', lineHeight: '1.8', margin: 0, color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: currentItem.story_hi }} />
                  </div>
                </div>
              )}
              <div className="content-section"><div className="section-header"><IconEn /> Meaning (EN)</div><p className="content-text">{currentItem.meaning_en}</p></div>
              <div className="content-section"><div className="section-header"><IconHi /> Meaning (HI)</div><p className="content-text hindi">{currentItem.meaning_hi}</p></div>
              {currentItem.example_en && <div className="content-section"><div className="section-header"><IconPen /> Example (EN)</div><p className="content-text" dangerouslySetInnerHTML={{ __html: currentItem.example_en }} /></div>}
              {currentItem.example_hi && <div className="content-section"><div className="section-header"><IconPen /> Example (HI)</div><p className="content-text hindi" dangerouslySetInnerHTML={{ __html: currentItem.example_hi }} /></div>}
              
              {hasRelations && (
                <div className="relations-wrapper">
                  <div className="relations-main-title"><IconLink /> Word Connections</div>
                  
                  {safeSynonyms.length > 0 && (
                    <div className="relation-group">
                      <h4>Synonyms</h4>
                      <div className="tag-list">
                        {safeSynonyms.map(t => <span key={t} className="tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-text)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{t}</span>)}
                      </div>
                    </div>
                  )}
                  
                  {safeAntonyms.length > 0 && (
                    <div className="relation-group">
                      <h4>Antonyms</h4>
                      <div className="tag-list">
                        {safeAntonyms.map(t => <span key={t} className="tag" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{t}</span>)}
                      </div>
                    </div>
                  )}

                  {/* RESTORED: Word Family */}
                  {safeWordFamily.length > 0 && (
                    <div className="relation-group">
                      <h4>Word Family</h4>
                      <div className="tag-list">
                        {safeWordFamily.map(t => <span key={t} className="tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{t}</span>)}
                      </div>
                    </div>
                  )}

                  {/* RESTORED: Collocations */}
                  {safeCollocations.length > 0 && (
                    <div className="relation-group">
                      <h4>Collocations</h4>
                      <div className="tag-list">
                        {safeCollocations.map(t => <span key={t} className="tag" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' }}>{t}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="nav-controls px-dynamic">
          {/* PREVIOUS BUTTON */}
          <button 
            onClick={() => navigateTo(prevWord)} 
            className="nav-btn" 
            style={{ opacity: prevWord ? 1 : 0.2, cursor: prevWord ? 'pointer' : 'default' }}
          >
            <span style={{ fontSize: '16px' }}>&larr;</span>
            <span className="nav-text-span">{prevWord || 'Prev'}</span>
          </button>
          
          {/* CENTER PROGRESS */}
          <div className="progress-container">
            <input 
  type="number" 
  className="progress-input" 
  value={currentIndex + 1} 
  onChange={handleJumpToCard}
  onFocus={(e) => e.target.select()}
  inputMode="numeric" // Forces numeric keypad on iPhone/Android
  min="1"
  max={totalCount}
/>
            <span>/ {totalCount}</span>
          </div>
          
          {/* NEXT BUTTON */}
          <button 
            onClick={() => navigateTo(nextWord)} 
            className="nav-btn" 
            style={{ 
              opacity: nextWord ? 1 : 0.3, 
              cursor: nextWord ? 'pointer' : 'default',
              justifyContent: 'flex-end' 
            }}
          >
            <span className="nav-text-span">{nextWord || 'Next'}</span>
            <span style={{ fontSize: '16px' }}>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}