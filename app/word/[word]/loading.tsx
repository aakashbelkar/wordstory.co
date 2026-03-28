export default function Loading() {
  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Inline style for the smooth spinning animation */}
      <style>{`
        @keyframes smoothSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-spinner {
          animation: smoothSpin 1s linear infinite;
          color: var(--accent-text); /* Uses your signature green */
        }
        .pulse-text {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
      `}</style>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* SVG Spinner */}
        <svg className="loading-spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        
        {/* Branded Text */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-logo)', fontSize: '28px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            WORDSTORY.co
          </h2>
          <p className="pulse-text" style={{ color: 'var(--text-light)', margin: 0, fontSize: '16px', fontWeight: '500' }}>
            Loading word...
          </p>
        </div>
      </div>
    </div>
  );
}