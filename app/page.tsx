import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Fetch the first word alphabetically
  const { data } = await supabase
    .from('words')
    .select('word')
    .order('word', { ascending: true })
    .limit(1);

  if (data && data.length > 0) {
    // Instantly redirect to that word's dedicated page
    redirect(`/word/${data[0].word.toLowerCase()}`);
  }

  // Fallback if the database is completely empty
  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-logo)' }}>WORDSTORY.co</h2>
      <p>No words found in database. Please add some from the admin panel.</p>
    </div>
  );
}