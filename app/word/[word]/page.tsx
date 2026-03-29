import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation'; // <-- 1. Imported the trigger
import WordClient from './WordClient';

// 1. Generate SEO Meta Tags dynamically
export async function generateMetadata({ params }: { params: Promise<{ word: string }> }): Promise<Metadata> {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  const { data } = await supabase.from('words').select('*').ilike('word', decodedWord).single();

  if (!data) return { title: 'Word Not Found | WordStory.co' };

  return {
    title: `${data.word} - Meaning in English & Hindi | WordStory.co`,
    description: `Learn the meaning of ${data.word}. English: ${data.meaning_en} Hindi: ${data.meaning_hi}.`,
    openGraph: { images: data.image_url ? [data.image_url] : [] }
  };
}

// 2. Server-Side Fetching & Calculations
export default async function WordPage({ params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  
  // A. Fetch the current word
  const { data: currentItem } = await supabase.from('words').select('*').ilike('word', decodedWord).single();

  // 2. THE CRITICAL CHANGE: Trigger the new 404 page if the word doesn't exist
  if (!currentItem) {
    notFound(); 
  }

  // B. Get Total Dictionary Size
  const { count: totalCount } = await supabase.from('words').select('*', { count: 'exact', head: true });

  // C. Calculate the exact index of this word
  const { count: precedingCount } = await supabase.from('words').select('*', { count: 'exact', head: true }).lt('word', currentItem.word);
  const currentIndex = precedingCount || 0;

  // D. Fetch Next and Previous words for instant routing
  const { data: prevData } = await supabase.from('words').select('word').lt('word', currentItem.word).order('word', { ascending: false }).limit(1);
  const { data: nextData } = await supabase.from('words').select('word').gt('word', currentItem.word).order('word', { ascending: true }).limit(1);
  
  const prevWord = prevData?.[0]?.word || null;
  const nextWord = nextData?.[0]?.word || null;

  // Render the interactive Client UI
  return (
    <WordClient 
      currentItem={currentItem} 
      prevWord={prevWord} 
      nextWord={nextWord} 
      totalCount={totalCount || 0}
      currentIndex={currentIndex}
    />
  );
}