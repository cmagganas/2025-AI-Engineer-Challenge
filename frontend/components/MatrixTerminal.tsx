import { useState, useRef, useEffect } from "react";
import { chat, ChatRequest } from "@/lib/api";
import dynamic from "next/dynamic";

const MatrixMiniRain = dynamic(() => import("@/components/MatrixMiniRain"));

/**
 * MatrixTerminal – a fun terminal-like chat interface that streams text from the
 * FastAPI backend.  It deliberately embraces a green-on-black "Matrix" theme.
 *
 * UX details / rationale (see frontend-rule):
 *   – High contrast: #00FF66 text on pure black.
 *   – Responsive: container flexes; output area scrolls as needed.
 *   – Sensitive fields (API key) use `type="password"`.
 *   – No external assets; pure Tailwind for styling.
 */
export default function MatrixTerminal() {
  // Form inputs
  const [developerMessage, setDeveloperMessage] = useState<string>(
    'Your name is Agent Smith. Greet the user, Neo from the movie the Matrix, with a "Hello Mr. Anderson..."'
  );
  const [userMessage, setUserMessage] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openai_api_key") ?? "";
    }
    return "";
  });

  // Streaming output
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Auto-scroll to bottom when output grows
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Keep apiKey in localStorage to persist across reloads
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }, [apiKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic validation
    if (!apiKey) {
      alert("Please provide your OpenAI API key.");
      return;
    }
    if (!userMessage) {
      alert("Please enter a user message.");
      return;
    }

    setIsLoading(true);

    // Append user's prompt to the terminal first
    setOutput((prev) => prev + `\n> ${userMessage}\n`);

    const request: ChatRequest = {
      developer_message: developerMessage,
      user_message: userMessage,
      api_key: apiKey,
    };

    try {
      const response = await chat(request);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          setOutput((prev) => prev + decoder.decode(value));
        }
      }
    } catch (err: any) {
      setOutput(`\n[ERROR] ${err.message ?? err}`);
    } finally {
      setIsLoading(false);
      setUserMessage("");
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 flex flex-col gap-6">
      {/* Box 1: Settings */}
      <div className="bg-[#0d0d0d] rounded-md p-4 flex flex-col gap-4 border border-green-800">
        <label className="flex flex-col gap-1 text-sm text-green-300">
          OpenAI API Key:
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="bg-black text-[#00FF66] font-mono p-2 rounded outline-none border border-green-700 focus:border-green-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-green-300">
          Developer Message (system prompt):
          <textarea
            value={developerMessage}
            onChange={(e) => setDeveloperMessage(e.target.value)}
            rows={2}
            className="bg-black text-[#00FF66] font-mono p-2 rounded outline-none border border-green-700 focus:border-green-400"
          />
        </label>
      </div>

      {/* Box 2: Terminal & Input */}
      <div className="bg-black rounded-md border border-green-700 shadow-inner flex flex-col relative overflow-hidden">
        {showIntro && (
          <MatrixMiniRain onDone={() => setShowIntro(false)} />
        )}
        {/* Terminal window */}
        <div
          ref={outputRef}
          className="text-[#00FF66] font-mono p-4 h-80 overflow-y-auto whitespace-pre-wrap"
        >
          {output || "// Streaming response will appear here…"}
          {isLoading && <span className="animate-pulse">▌</span>}
        </div>

        {/* Prompt input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-green-700 p-2 flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            className="flex-1 bg-black text-[#00FF66] font-mono px-2 py-1 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 text-black font-semibold rounded hover:bg-green-500 disabled:opacity-60 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 