"use client";

import { useEffect, useRef } from "react";

interface MiniRainProps {
  onDone: () => void;
  durationMs?: number;
}

/**
 * MatrixMiniRain – self-contained canvas rain effect that lives inside its
 * parent element.  Automatically stops and calls `onDone` after `durationMs`.
 */
export default function MatrixMiniRain({ onDone, durationMs = 2500 }: MiniRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // fit canvas to parent size
    const resize = () => {
      if (!canvas.parentElement) return;
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    const symbols = "01ﾊﾐﾑﾒﾓｩ｣ﾘｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄｶ".split("");
    const fontSize = 14;
    const columns = () => Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns()).fill(0);

    const step = () => {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00FF66";
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const char = symbols[Math.floor(Math.random() * symbols.length)];
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        } else {
          drops[i]++;
        }
      });
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);

    timeoutRef.current = setTimeout(() => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      onDone();
    }, durationMs);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [durationMs, onDone]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0" />
  );
} 