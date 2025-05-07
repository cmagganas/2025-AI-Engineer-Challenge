'use client';

export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
      <div className="text-[#00FF41] text-xl font-mono font-bold matrix-glitch-text">
        LOADING MATRIX...
      </div>
      <div className="mt-8 w-64 h-2 bg-[#0D0208] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#00FF41]"
          style={{ 
            width: '100%', 
            animation: 'load 2s ease-in-out infinite',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes load {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
} 