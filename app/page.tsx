'use client'
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Moon, Info, Volume2, Link as LinkIcon, PenTool, Globe, X } from 'lucide-react';

export default function Home() {
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch words from Supabase
  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase.from('words').select('*').order('created_at', { ascending: false });
      if (data) setWords(data);
    };
    fetchWords();
  }, []);

  // Theme logic
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

  // Audio logic
  const playAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Search logic
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const { data } = await supabase.from('words').select('*').ilike('word', `%${query}%`).limit(5);
      if (data) setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (wordId: string) => {
    const index = words.findIndex(w => w.id === wordId);
    if (index !== -1) {
      setCurrentIndex(index);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Keyboard navigation
  const goToNext = useCallback(() => { if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1); }, [currentIndex, words.length]);
  const goToPrev = useCallback(() => { if (currentIndex > 0) setCurrentIndex(prev => prev - 1); }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (words.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading WordStory...</div>;

  const currentItem = words[currentIndex];

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-[800px] min-h-screen bg-[var(--app-bg)] shadow-xl flex flex-col relative transition-colors duration-300">
        
        {/* Info Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[var(--modal-overlay)] z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div className="bg-[var(--app-bg)] w-[85%] max-w-[500px] p-8 rounded-2xl border border-[var(--border)] relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--hover-bg)] text-[var(--text-light)]"><X size={20} /></button>
              <h3 className="font-serif text-2xl mb-4">How to use WordStory</h3>
              <ul className="list-disc pl-5 text-[var(--text-light)] space-y-3">
                <li><strong>Swipe or use arrow keys</strong> to navigate.</li>
                <li><strong>Listen</strong> to the exact pronunciation by tapping the speaker icon.</li>
                <li><strong>Search</strong> for any English word or Hindi meaning in the top bar.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="px-5 sm:px-10 pt-5 pb-4 flex justify-between items-center border-b border-[var(--border)]">
          <h1 className="font-serif text-2xl font-bold tracking-tight">WORDSTORY.co</h1>
          <div className="flex gap-2">
            <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-[var(--hover-bg)] text-[var(--icon-color)]"><Info size={22} /></button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--hover-bg)] text-[var(--icon-color)]"><Moon size={22} /></button>
          </div>
        </header>

        {/* Search */}
        <div className="px-5 sm:px-10 pt-4 relative z-40">
          <div className="relative flex items-center">
            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Search vocabulary..." className="w-full py-3 px-5 rounded-full border border-[var(--border)] bg-[var(--bg-color)] text-[var(--text-main)] outline-none focus:border-[var(--text-light)] focus:ring-4 focus:ring-[var(--accent-bg)] transition-all" />
          </div>
          {searchResults.length > 0 && (
            <ul className="absolute top-full left-5 right-5 sm:left-10 sm:right-10 mt-2 bg-[var(--app-bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
              {searchResults.map(result => (
                <li key={result.id} onClick={() => selectSearchResult(result.id)} className="p-3 px-5 cursor-pointer hover:bg-[var(--hover-bg)] border-b border-[var(--border)] last:border-0 flex flex-col gap-1">
                  <span className="font-semibold text-[var(--text-main)]">{result.word}</span>
                  <span className="text-sm text-[var(--text-light)]">{result.meaning_en}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Controls */}
        <div className="px-5 sm:px-10 py-4 flex justify-between items-center border-b border-[var(--border)]">
          <button onClick={goToPrev} disabled={currentIndex === 0} className="font-semibold text-[var(--text-light)] disabled:opacity-30 hover:text-[var(--text-main)] px-3 py-2">&larr; Prev</button>
          <div className="flex items-center bg-[var(--bg-color)] px-4 py-1.5 rounded-full text-[var(--text-light)] font-medium">
            <input type="number" value={currentIndex + 1} onChange={(e) => setCurrentIndex(Number(e.target.value) - 1)} className="bg-transparent border-none text-[var(--text-main)] font-semibold text-right w-8 outline-none" min="1" max={words.length} />
            <span> / {words.length}</span>
          </div>
          <button onClick={goToNext} disabled={currentIndex === words.length - 1} className="font-semibold text-[var(--text-light)] disabled:opacity-30 hover:text-[var(--text-main)] px-3 py-2">Next &rarr;</button>
        </div>

        {/* Flashcard Area */}
        <div className="flex-grow px-5 sm:px-10 py-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-1">
            <h2 className="font-serif text-4xl sm:text-6xl font-bold m-0 leading-tight">{currentItem.word}</h2>
            <button onClick={() => playAudio(currentItem.word)} className="bg-[var(--accent-bg)] text-[var(--accent-text)] rounded-full w-11 h-11 flex items-center justify-center flex-shrink-0 ml-4 hover:scale-95 transition-transform"><Volume2 size={22} /></button>
          </div>
          <div className="text-[var(--text-light)] mb-8 tracking-wide">{currentItem.phonetic}</div>

          {currentItem.image_url && (
            <div className="w-full aspect-video sm:aspect-[4/3] bg-[var(--image-bg)] rounded-2xl overflow-hidden mb-8 shadow-sm flex items-center justify-center">
              <img src={currentItem.image_url} alt={currentItem.word} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Meanings & Examples */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2"><Globe size={16} /> Meaning in English</div>
              <p className="text-lg text-[var(--text-main)]">{currentItem.meaning_en}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2"><Globe size={16} /> Meaning in Hindi</div>
              <p className="text-xl font-hindi text-[var(--text-main)]">{currentItem.meaning_hi}</p>
            </div>
            {currentItem.example_en && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2"><PenTool size={16} /> Example in English</div>
                <p className="text-lg text-[var(--text-main)]" dangerouslySetInnerHTML={{ __html: currentItem.example_en }} />
              </div>
            )}
            {currentItem.example_hi && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-light)] uppercase tracking-wider mb-2"><PenTool size={16} /> Example in Hindi</div>
                <p className="text-xl font-hindi text-[var(--text-main)]" dangerouslySetInnerHTML={{ __html: currentItem.example_hi }} />
              </div>
            )}
          </div>

          {/* Word Relations */}
          {(currentItem.synonyms || currentItem.antonyms) && (
            <div className="mt-10 pt-8 border-t border-[var(--border)]">
              <div className="text-xl font-bold flex items-center gap-2 mb-6 text-[var(--text-main)]"><LinkIcon size={22} /> Word Relations</div>
              
              <div className="space-y-5">
                {currentItem.synonyms && currentItem.synonyms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-light)] mb-3">Synonyms</h4>
                    <div className="flex flex-wrap gap-2">{currentItem.synonyms.map((s: string) => <span key={s} className="bg-[var(--accent-tag-bg)] text-[var(--accent-tag-text)] px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>)}</div>
                  </div>
                )}
                {currentItem.antonyms && currentItem.antonyms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-light)] mb-3">Antonyms</h4>
                    <div className="flex flex-wrap gap-2">{currentItem.antonyms.map((s: string) => <span key={s} className="bg-[var(--accent-tag-bg)] text-[var(--accent-tag-text)] px-3 py-1.5 rounded-lg text-sm font-medium">{s}</span>)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}