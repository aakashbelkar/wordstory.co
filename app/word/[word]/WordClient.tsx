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

export default function WordClient({ currentItem, prevWord, nextWord, totalCount, currentIndex }: WordClientProps) {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const flashcardRef = useRef<HTMLDivElement>(null);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const playAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Search Logic
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
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/word/${wordText.toLowerCase()}`);
  };

  // Navigation Logic (Keyboard & Swipe)
  const navigateTo = (word: string | null) => {
    if (!word) return;
    if (flashcardRef.current) flashcardRef.current.style.opacity = '0';
    setTimeout(() => {
      router.push(`/word/${word.toLowerCase()}`);
    }, 100);
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

  // Jump to specific card number logic
  const handleJumpToCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value);
    if (val >= 1 && val <= totalCount) {
      // Find the word at that exact index
      const { data } = await supabase.from('words').select('word').order('word', { ascending: true }).range(val - 1, val - 1).single();
      if (data) navigateTo(data.word);
    }
  };

  return (
    <div className="app-container">
      {/* FIXED INFO MODAL */}
      <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
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
          <button className="icon-btn" aria-label="Information" onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </button>
          <button className="icon-btn" aria-label="Toggle Dark Mode" onClick={toggleTheme}>
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
        </div>
      </header>

      <div className="search-wrapper px-dynamic">
        <div className="search-input-container">
          <input type="text" id="searchInput" placeholder="Search vocabulary..." autoComplete="off" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery && <button id="clearBtn" aria-label="Clear search" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>&times;</button>}
        </div>
        {searchResults.length > 0 && (
          <ul className="autocomplete-dropdown" style={{ display: 'block' }}>
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
        {prevWord ? (
          <Link href={`/word/${prevWord.toLowerCase()}`} className="nav-btn" style={{ textDecoration: 'none' }}>&larr; {prevWord}</Link>
        ) : <div className="nav-btn" style={{ opacity: 0.3 }}>&larr; Prev</div>}
        
        <div className="progress-container">
          <input type="number" className="progress-input" min="1" max={totalCount} value={currentIndex + 1} onChange={handleJumpToCard} />
          <span className="totalProgress"> / {totalCount}</span>
        </div>

        {nextWord ? (
          <Link href={`/word/${nextWord.toLowerCase()}`} className="nav-btn" style={{ textDecoration: 'none' }}>{nextWord} &rarr;</Link>
        ) : <div className="nav-btn" style={{ opacity: 0.3 }}>Next &rarr;</div>}
      </div>

      {/* FLASHCARD CONTENT */}
      <div className="flashcard-container px-dynamic" id="flashcardArea" ref={flashcardRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ transition: 'opacity 0.15s ease' }}>
        <div className="word-header-row">
          <h2 className="word-title">{currentItem.word}</h2>
          <button className="audio-btn" aria-label="Listen" onClick={() => playAudio(currentItem.word)}>
            <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          </button>
        </div>
        <div className="word-phonetic">{currentItem.phonetic}</div>

        {currentItem.image_url && (
          <div className="hero-image-container">
            <img src={currentItem.image_url} alt={currentItem.word} className="hero-image" onError={(e) => e.currentTarget.parentElement!.style.display = 'none'} />
          </div>
        )}

        <div className="content-section">
          <div className="section-header"><IconEn /> Meaning in English</div>
          <p className="content-text">{currentItem.meaning_en}</p>
        </div>

        <div className="content-section">
          <div className="section-header"><IconHi /> Meaning in Hindi</div>
          <p className="content-text hindi">{currentItem.meaning_hi}</p>
        </div>

        {currentItem.example_en && (
          <div className="content-section">
            <div className="section-header"><IconPen /> Example in English</div>
            <p className="content-text" dangerouslySetInnerHTML={{ __html: currentItem.example_en }} />
          </div>
        )}

        {currentItem.example_hi && (
          <div className="content-section">
            <div className="section-header"><IconPen /> Example in Hindi</div>
            <p className="content-text hindi" dangerouslySetInnerHTML={{ __html: currentItem.example_hi }} />
          </div>
        )}

        {(currentItem.synonyms?.length > 0 || currentItem.antonyms?.length > 0 || currentItem.word_family?.length > 0 || currentItem.collocations?.length > 0) && (
          <div className="relations-wrapper">
            <div className="relations-main-title"><IconLink /> Word Relations</div>
            {currentItem.synonyms?.length > 0 && <div className="relation-group"><h4>Synonyms</h4><div className="tag-list">{currentItem.synonyms.map((t: string) => <span key={t} className="tag">{t}</span>)}</div></div>}
            {currentItem.antonyms?.length > 0 && <div className="relation-group"><h4>Antonyms</h4><div className="tag-list">{currentItem.antonyms.map((t: string) => <span key={t} className="tag">{t}</span>)}</div></div>}
            {currentItem.word_family?.length > 0 && <div className="relation-group"><h4>Word Family</h4><div className="tag-list">{currentItem.word_family.map((t: string) => <span key={t} className="tag">{t}</span>)}</div></div>}
            {currentItem.collocations?.length > 0 && <div className="relation-group"><h4>Collocations</h4><div className="tag-list">{currentItem.collocations.map((t: string) => <span key={t} className="tag">{t}</span>)}</div></div>}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="nav-controls bottom px-dynamic">
        {prevWord ? (
          <Link href={`/word/${prevWord.toLowerCase()}`} className="nav-btn" style={{ textDecoration: 'none' }}>&larr; {prevWord}</Link>
        ) : <div className="nav-btn" style={{ opacity: 0.3 }}>&larr; Prev</div>}
        
        <div className="progress-container">
          <input type="number" className="progress-input" min="1" max={totalCount} value={currentIndex + 1} onChange={handleJumpToCard} />
          <span className="totalProgress"> / {totalCount}</span>
        </div>

        {nextWord ? (
          <Link href={`/word/${nextWord.toLowerCase()}`} className="nav-btn" style={{ textDecoration: 'none' }}>{nextWord} &rarr;</Link>
        ) : <div className="nav-btn" style={{ opacity: 0.3 }}>Next &rarr;</div>}
      </div>

    </div>
  );
}