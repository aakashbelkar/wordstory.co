import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import WordClient from './WordClient';

// 1. Generate SEO Meta Tags dynamically (Clean & High-Performance)
export async function generateMetadata({ params }: { params: Promise<{ word: string }> }): Promise<Metadata> {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  
  // We only select the fields needed for SEO to save bandwidth
  const { data } = await supabase
    .from('words')
    .select('word, meaning_en, meaning_hi')
    .ilike('word', decodedWord)
    .single();

  if (!data) return { title: 'Word Not Found | WordStory.co' };

  const capitalized = data.word.charAt(0).toUpperCase() + data.word.slice(1);

  return {
    title: `${capitalized} - Meaning, Story & Examples | WordStory.co`,
    description: `Master "${data.word}" (${data.meaning_hi}). English: ${data.meaning_en}. Practice with stories and active recall on WordStory.`,
    openGraph: {
      title: `${capitalized} Meaning & Usage`,
      description: `Understand "${data.word}" forever with our unique story-based learning.`,
      type: 'article',
    }
  };
}

// 2. Optimized Server-Side Fetching
export default async function WordPage({ params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const decodedWord = decodeURIComponent(word);
  
  // A. Fetch the current word details
  const { data: currentItem } = await supabase
    .from('words')
    .select('*')
    .ilike('word', decodedWord)
    .single();

  // Trigger the 404 page if word is missing
  if (!currentItem) {
    notFound(); 
  }

  /**
   * PERFORMANCE MASTERSTROKE:
   * We run these counts and neighbor fetches in parallel (Promise.all).
   * This is $O(log n)$ speed—lightning fast even at 40,000 words.
   */
  const [prevRes, nextRes, countRes, indexRes] = await Promise.all([
    // Fetch PREVIOUS word
    supabase.from('words').select('word').lt('word', currentItem.word).order('word', { ascending: false }).limit(1).maybeSingle(),
    
    // Fetch NEXT word
    supabase.from('words').select('word').gt('word', currentItem.word).order('word', { ascending: true }).limit(1).maybeSingle(),
    
    // Get Total Dictionary Size
    supabase.from('words').select('*', { count: 'exact', head: true }),
    
    // Calculate the exact index of this word (by counting words alphabetically before it)
    supabase.from('words').select('*', { count: 'exact', head: true }).lt('word', currentItem.word)
  ]);

  return (
    <WordClient 
      currentItem={currentItem} 
      prevWord={prevRes.data?.word || null} 
      nextWord={nextRes.data?.word || null} 
      totalCount={countRes.count || 0}
      currentIndex={indexRes.count || 0}
    />
  );
}