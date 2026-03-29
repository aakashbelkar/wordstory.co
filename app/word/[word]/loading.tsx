export default function Loading() {
  return (
    <div className="app-container">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--hover-bg) 25%, var(--border) 50%, var(--hover-bg) 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      {/* Static Header so the app structure never jumps */}
      <header className="px-dynamic">
        <h1 style={{ color: 'var(--text-main)', opacity: 0.5 }}>WORDSTORY.co</h1>
        <div className="skeleton" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
      </header>

      {/* Search Bar Skeleton */}
      <div className="search-wrapper px-dynamic">
        <div className="skeleton" style={{ width: '100%', height: '50px', borderRadius: '999px' }}></div>
      </div>

      {/* Nav Skeleton */}
      <div className="nav-controls px-dynamic">
        <div className="skeleton" style={{ width: '60px', height: '24px' }}></div>
        <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '999px' }}></div>
        <div className="skeleton" style={{ width: '60px', height: '24px' }}></div>
      </div>

      <div className="flashcard-container px-dynamic">
        {/* Hero Image Skeleton (Matches your 4/3 aspect ratio perfectly) */}
        <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3', borderRadius: '20px', marginBottom: '32px' }}></div>

        {/* Text Block Skeletons */}
        <div style={{ marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ width: '100%', height: '20px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ width: '85%', height: '20px' }}></div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div className="skeleton" style={{ width: '120px', height: '16px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ width: '95%', height: '20px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ width: '70%', height: '20px' }}></div>
        </div>
      </div>
    </div>
  );
}