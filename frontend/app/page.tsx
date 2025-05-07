"use client";

import dynamic from "next/dynamic";

// Lazy-load the terminal component to avoid it being part of the initial JS chunk.
const MatrixTerminal = dynamic(() => import("@/components/MatrixTerminal"), {
  ssr: false,
});

const MatrixRain = dynamic(() => import("@/components/MatrixRain"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-black relative flex flex-col items-center pt-10">
      <MatrixRain />
      <h1 className="text-[#00FF66] font-mono text-2xl mb-6 z-10">
        🔴 Hacking the Matrix 🔵
      </h1>
      <div className="z-10 w-full"><MatrixTerminal /></div>
    </main>
  );
}
