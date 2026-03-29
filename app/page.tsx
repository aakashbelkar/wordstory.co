import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'WordStory - Learn Vocabulary through Stories',
  description: 'Master English, Hindi, and Marathi vocabulary with engaging stories and active recall.',
};

export default async function Home() {
  // Efficiently fetch only the single first word
  const { data } = await supabase
    .from('words')
    .select('word')
    .order('word', { ascending: true })
    .limit(1)
    .single();

  if (data) {
    redirect(`/word/${data.word.toLowerCase()}`);
  }

  // Fallback with Emerald Green styling to match your new theme
  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontWeight: 900, fontSize: '24px', color: '#0f172a' }}>
        WORD<span style={{ color: '#10b981' }}>STORY</span>
      </h1>
      <p style={{ color: '#64748b', marginTop: '8px' }}>No words found in database. Add some via the admin panel.</p>
    </div>
  );
}