import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';

// 1. Generate SEO Meta Tags dynamically (Awaited for Next.js 15+)
export async function generateMetadata({ params }: { params: Promise<{ word: string }> }): Promise<Metadata> {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  const { data } = await supabase.from('words').select('*').ilike('word', decodedWord).single();

  if (!data) return { title: 'Word Not Found | WordStory.co' };

  return {
    title: `${data.word} - Meaning in English & Hindi | WordStory.co`,
    description: `Learn the meaning of ${data.word}. English: ${data.meaning_en} Hindi: ${data.meaning_hi}. See examples, synonyms, and pronunciation.`,
    openGraph: {
      images: data.image_url ? [data.image_url] : [],
    }
  };
}

// 2. Server-Side Render the Page (Awaited for Next.js 15+)
export default async function WordPage({ params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  
  // Fetch the current word
  const { data: currentItem } = await supabase.from('words').select('*').ilike('word', decodedWord).single();

  if (!currentItem) {
    return <div className="app-container"><div className="px-dynamic pt-20 text-center font-medium">Word not found.</div></div>;
  }

  // Fetch Previous and Next words alphabetically for SEO linking
  const { data: prevData } = await supabase.from('words').select('word').lt('word', currentItem.word).order('word', { ascending: false }).limit(1);
  const { data: nextData } = await supabase.from('words').select('word').gt('word', currentItem.word).order('word', { ascending: true }).limit(1);
  
  const prevWord = prevData?.[0]?.word;
  const nextWord = nextData?.[0]?.word;

  return (
    <div className="app-container">
      <header className="px-dynamic">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>WORDSTORY.co</h1>
        </Link>
      </header>

      <div className="flashcard-container px-dynamic">
        <div className="word-header-row">
          <h2 className="word-title">{currentItem.word}</h2>
        </div>
        <div className="word-phonetic">{currentItem.phonetic}</div>

        {currentItem.image_url && (
          <div className="hero-image-container">
            <img src={currentItem.image_url} alt={currentItem.word} className="hero-image" />
          </div>
        )}

        <div className="content-section">
          <div className="section-header">Meaning in English</div>
          <p className="content-text">{currentItem.meaning_en}</p>
        </div>

        <div className="content-section">
          <div className="section-header">Meaning in Hindi</div>
          <p className="content-text hindi">{currentItem.meaning_hi}</p>
        </div>

        {/* SEO-Friendly Next/Prev Links */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex justify-between items-center">
            {prevWord ? (
                <Link href={`/word/${prevWord.toLowerCase()}`} className="nav-btn bg-[var(--bg-color)] px-4 py-2" style={{ textDecoration: 'none' }}>
                    &larr; {prevWord}
                </Link>
            ) : <div />}
            
            <Link href="/" className="nav-btn px-4 py-2 font-bold" style={{ textDecoration: 'none', color: 'var(--accent-text)' }}>
                Study Full Deck
            </Link>

            {nextWord ? (
                <Link href={`/word/${nextWord.toLowerCase()}`} className="nav-btn bg-[var(--bg-color)] px-4 py-2" style={{ textDecoration: 'none' }}>
                    {nextWord} &rarr;
                </Link>
            ) : <div />}
        </div>
      </div>
    </div>
  );
}