'use client'
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const IconEn = () => <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const IconHi = () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconPen = () => <svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>;
const IconLink = () => <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;

interface WordClientProps {
  currentItem: any;
  prevWord: string | null;
  nextWord: string | null;
  totalCount: number;
  currentIndex: number;
}

const getPremiumGradient = (word: string) => {
  const gradients = [
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    'linear-gradient(135deg, #1e1366 0%, #2a0845 100%)',
    'linear-gradient(135deg, #232526 0%, #414345 100%)'
  ];
  return gradients[word.length % gradients.length];
};

export default function WordClient({ currentItem, prevWord, nextWord, totalCount, currentIndex }: WordClientProps) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const flashcardRef = useRef<HTMLDivElement>(null);

  // Calculate Progress Percentage for the Edge Bar
  const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

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

  // --- HAPTIC FEEDBACK (Micro-interaction magic) ---
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15); // A crisp, 15ms physical "tick" on mobile
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
    router.push(`/word/${wordText.toLowerCase()}`);
  };

  const navigateTo = (word: string | null) => {
    if (!word) return;
    triggerHaptic(); // Vibrate when swiping or clicking next!
    if (flashcardRef.current) {
      flashcardRef.current.style.transform = 'translateY(10px)';
      flashcardRef.current.style.opacity = '0';
    }
    setTimeout(() => {
      router.push(`/word/${word.toLowerCase()}`);
    }, 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') navigateTo(nextWord);
      if (e.key === 'ArrowLeft') navigateTo(prevWord);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWord, prevWord]);

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
    <div className="app-container" style={{ position: 'relative' }}>
      {/* THE EDGE PROGRESS BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', backgroundColor: 'var(--accent-text)', width: `${progressPercentage}%`, zIndex: 9999, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', borderTopRightRadius: '4px', borderBottomRightRadius: '4px', boxShadow: '0 0 10px var(--accent-text)' }} />

      {/* GLASSMORPHIC INFO MODAL */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" style={{ backdropFilter: 'blur(20px)', backgroundColor: 'var(--app-bg)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={() => { triggerHaptic(); setIsModalOpen(false); }}>&times;</button>
          <h3 className="modal-title">How to use WordStory</h3>
          <ul className="modal-list">
            <li><strong>Swipe or use arrow keys</strong> to navigate through the deck.</li>
            <li><strong>Jump to a card</strong> by typing a number in the progress indicator.</li>
            <li><strong>Listen</strong> to the exact pronunciation by tapping the speaker icon.</li>
            <li><strong>Search</strong> for any English word or Hindi meaning in the top bar.</li>
          </ul>
        </div>
      </div>

      <header className="px-dynamic">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>WORDSTORY.co</h1>
        </Link>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Information" onClick={() => { triggerHaptic(); setIsModalOpen(true); }}>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </button>
          <button className="icon-btn" aria-label="Toggle Dark Mode" onClick={toggleTheme}>
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
        </div>
      </header>

      {/* SEARCH BAR WITH GLASS DROPDOWN */}
      <div className="search-wrapper px-dynamic">
        <div className="search-input-container">
          <input type="text" id="searchInput" placeholder="Search vocabulary..." autoComplete="off" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <button id="clearBtn" aria-label="Clear search" onClick={() => { triggerHaptic(); setSearchQuery(''); setSearchResults([]); }}>&times;</button>}
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

      {/* TOP CONTROLS */}
      <div className="nav-controls px-dynamic">
        <button onClick={() => navigateTo(prevWord)} className="nav-btn" style={{ opacity: prevWord ? 1 : 0.3, cursor: prevWord ? 'pointer' : 'default' }}>&larr; {prevWord || 'Prev'}</button>
        <div className="progress-container">
          <input type="number" className="progress-input" min="1" max={totalCount} value={currentIndex + 1} onChange={handleJumpToCard} />
          <span className="totalProgress"> / {totalCount}</span>
        </div>
        <button onClick={() => navigateTo(nextWord)} className="nav-btn" style={{ opacity: nextWord ? 1 : 0.3, cursor: nextWord ? 'pointer' : 'default' }}>{nextWord || 'Next'} &rarr;</button>
      </div>

      {/* FLASHCARD CONTENT */}
      <div className="flashcard-container px-dynamic" id="flashcardArea" ref={flashcardRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        
        {/* APPLE-STYLE EDITORIAL HERO CARD */}
        <div style={{ 
            width: '100%', aspectRatio: '4/3', borderRadius: '20px', overflow: 'hidden', 
            position: 'relative', marginBottom: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            background: currentItem.image_url ? '#000' : getPremiumGradient(currentItem.word)
        }}>
          {currentItem.image_url && (
            <img src={currentItem.image_url} alt={currentItem.word} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }}></div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1 }}>{currentItem.word}</h2>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', letterSpacing: '0.02em' }}>{currentItem.phonetic}</div>
            </div>
            <button 
              onClick={() => playAudio(currentItem.word)}
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s ease, background 0.2s ease' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'currentColor' }}><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            </button>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header"><IconEn /> Meaning in English</div>
          <p className="content-text">{currentItem.meaning_en}</p>
        </div>

        <div className="content-section">
          <div className="section-header"><IconHi /> Meaning in Hindi</div>
          <p className="content-text hindi">{currentItem.meaning_hi}</p>
        </div>

        {/* EDITORIAL QUOTE DESIGN FOR EXAMPLES */}
        {currentItem.example_en && (
          <div className="content-section">
            <div className="section-header"><IconPen /> Example in English</div>
            <div style={{ position: 'relative', padding: '16px 20px', background: 'var(--hover-bg)', borderLeft: '4px solid var(--accent-text)', borderRadius: '0 8px 8px 0', marginTop: '8px' }}>
              <span style={{ position: 'absolute', top: '-10px', right: '16px', fontSize: '72px', fontFamily: 'var(--font-serif)', color: 'var(--accent-text)', opacity: 0.1, lineHeight: 1 }}>"</span>
              <p className="content-text" style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: currentItem.example_en }} />
            </div>
          </div>
        )}

        {currentItem.example_hi && (
          <div className="content-section">
            <div className="section-header"><IconPen /> Example in Hindi</div>
            <div style={{ position: 'relative', padding: '16px 20px', background: 'var(--hover-bg)', borderLeft: '4px solid var(--accent-text)', borderRadius: '0 8px 8px 0', marginTop: '8px' }}>
              <span style={{ position: 'absolute', top: '-10px', right: '16px', fontSize: '72px', fontFamily: 'var(--font-serif)', color: 'var(--accent-text)', opacity: 0.1, lineHeight: 1 }}>"</span>
              <p className="content-text hindi" style={{ position: 'relative', zIndex: 1 }} dangerouslySetInnerHTML={{ __html: currentItem.example_hi }} />
            </div>
          </div>
        )}

        {/* RELATIONS */}
        {(currentItem.synonyms?.length > 0 || currentItem.antonyms?.length > 0 || currentItem.word_family?.length > 0 || currentItem.collocations?.length > 0) && (
          <div className="relations-wrapper">
            <div className="relations-main-title"><IconLink /> Word Relations</div>
            {currentItem.synonyms?.length > 0 && <div className="relation-group"><h4>Synonyms</h4><div className="tag-list">{currentItem.synonyms.map((t: string) => <span key={t} className="tag" style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{t}</span>)}</div></div>}
            {currentItem.antonyms?.length > 0 && <div className="relation-group"><h4>Antonyms</h4><div className="tag-list">{currentItem.antonyms.map((t: string) => <span key={t} className="tag" style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{t}</span>)}</div></div>}
            {currentItem.word_family?.length > 0 && <div className="relation-group"><h4>Word Family</h4><div className="tag-list">{currentItem.word_family.map((t: string) => <span key={t} className="tag" style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{t}</span>)}</div></div>}
            {currentItem.collocations?.length > 0 && <div className="relation-group"><h4>Collocations</h4><div className="tag-list">{currentItem.collocations.map((t: string) => <span key={t} className="tag" style={{ transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{t}</span>)}</div></div>}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="nav-controls bottom px-dynamic">
        <button onClick={() => navigateTo(prevWord)} className="nav-btn" style={{ opacity: prevWord ? 1 : 0.3, cursor: prevWord ? 'pointer' : 'default' }}>&larr; {prevWord || 'Prev'}</button>
        <div className="progress-container">
          <input type="number" className="progress-input" min="1" max={totalCount} value={currentIndex + 1} onChange={handleJumpToCard} />
          <span className="totalProgress"> / {totalCount}</span>
        </div>
        <button onClick={() => navigateTo(nextWord)} className="nav-btn" style={{ opacity: nextWord ? 1 : 0.3, cursor: nextWord ? 'pointer' : 'default' }}>{nextWord || 'Next'} &rarr;</button>
      </div>

    </div>
  );
}