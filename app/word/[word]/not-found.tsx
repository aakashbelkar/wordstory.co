import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="px-dynamic" style={{ paddingTop: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-logo)', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            WORDSTORY.co
          </h1>
        </Link>
      </header>

      {/* 404 Content */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        
        {/* Giant, subtle background element */}
        <div style={{ fontSize: '120px', lineHeight: 1, marginBottom: '24px', opacity: 0.1 }}>
          <svg viewBox="0 0 24 24" style={{ width: '120px', height: '120px', fill: 'currentColor' }}><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 12px 0', lineHeight: 1.1 }}>
          Word not found.
        </h2>
        
        <p style={{ color: 'var(--text-light)', fontSize: '18px', maxWidth: '400px', margin: '0 0 40px 0', lineHeight: 1.6 }}>
          It looks like this word hasn't made it into our dictionary yet. But your vocabulary journey shouldn't stop here.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px' }}>
          
          {/* Action 1: Keep them in the app loop */}
          <Link 
            href="/" 
            style={{ 
              backgroundColor: 'var(--accent-text)', 
              color: '#ffffff', 
              padding: '16px 24px', 
              borderRadius: '999px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '16px',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 14px rgba(26, 137, 23, 0.2)'
            }}
          >
            Study the Full Deck
          </Link>

          {/* Action 2: User Research / Crowdsourcing */}
          <a 
            href="mailto:hello@wordstory.co?subject=Please add this word!&body=Hi! I searched for a word and couldn't find it. Please add it to the dictionary: " 
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--text-main)', 
              padding: '16px 24px', 
              borderRadius: '999px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '16px',
              border: '2px solid var(--border)',
              transition: 'background-color 0.2s ease'
            }}
          >
            Request a Word
          </a>
        </div>
      </div>
    </div>
  );
}