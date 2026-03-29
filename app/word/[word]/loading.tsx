export default function LoadingWord() {
  return (
    <div className="app-container" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      
      <style>{`
        .bg-glow-1 { position: fixed; top: -10vw; left: -10vw; width: 40vw; height: 40vw; background: radial-gradient(circle, var(--accent-text) 0%, transparent 60%); opacity: 0.05; z-index: -1; pointer-events: none; border-radius: 50%; }
        .bg-glow-2 { position: fixed; bottom: -10vw; right: -10vw; width: 50vw; height: 50vw; background: radial-gradient(circle, #3b82f6 0%, transparent 60%); opacity: 0.04; z-index: -1; pointer-events: none; border-radius: 50%; }
        
        @keyframes shimmerEffect {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border) 50%, var(--hover-bg) 75%);
          background-size: 200% 100%;
          animation: shimmerEffect 1.5s infinite linear;
          opacity: 0.7;
        }

        /* DESKTOP CENTERING WRAPPER */
        .desktop-centered {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>

      {/* Ambient Orbs for Loading State too */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className="desktop-centered">
        <header className="px-dynamic" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '16px', 
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ textDecoration: 'none' }}>
            <h1 style={{ margin: 0, display: 'flex', alignItems: 'baseline', letterSpacing: '-0.03em', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--text-main)' }}>WORD</span>
              <span style={{ fontWeight: 900, fontSize: '24px', color: 'var(--accent-text)', marginLeft: '1px' }}>STORY</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-light)', marginLeft: '4px', opacity: 0.6 }}>.co</span>
            </h1>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
            <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
          </div>
        </header>

        <div className="search-wrapper px-dynamic" style={{ marginTop: '24px' }}>
          <div className="shimmer" style={{ height: '56px', borderRadius: '12px', width: '100%' }}></div>
        </div>

        <div className="nav-controls px-dynamic" style={{ marginTop: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <div className="shimmer" style={{ width: '80px', height: '40px', borderRadius: '8px' }}></div>
          <div className="shimmer" style={{ width: '100px', height: '40px', borderRadius: '8px' }}></div>
          <div className="shimmer" style={{ width: '80px', height: '40px', borderRadius: '8px' }}></div>
        </div>

        <div className="flashcard-container px-dynamic">
          <div className="shimmer" style={{ width: '100%', aspectRatio: '4/3', maxHeight: '50vh', borderRadius: '20px', marginBottom: '32px' }}></div>
          
          <div style={{ marginBottom: '40px' }}>
            <div className="shimmer" style={{ width: '150px', height: '24px', borderRadius: '4px', marginBottom: '16px' }}></div>
            <div className="shimmer" style={{ width: '100%', height: '120px', borderRadius: '16px' }}></div>
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <div className="shimmer" style={{ width: '180px', height: '24px', borderRadius: '4px', marginBottom: '16px' }}></div>
            <div className="shimmer" style={{ width: '100%', height: '60px', borderRadius: '8px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}