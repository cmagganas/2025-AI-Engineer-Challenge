import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for the components that use browser APIs
const MatrixTerminal = dynamic(() => import('./components/MatrixTerminal'), { ssr: false });
const MatrixRain = dynamic(() => import('./components/MatrixRain'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <MatrixRain />
      <MatrixTerminal />
    </main>
  );
}
