'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import axios from 'axios';
import 'xterm/css/xterm.css';

// Define API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Matrix color theme
const MATRIX_GREEN = '#00FF41';
const MATRIX_BG = '#0D0208';
// const MATRIX_ERROR = '#FF0000'; // Keeping for future use but commented to avoid ESLint warning

export default function MatrixTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Function to handle command execution
  const handleCommand = useCallback(async (command: string) => {
    if (!term) return;
    
    // Split command into parts
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    switch (cmd) {
      case 'health':
        try {
          term.write('\x1b[33mChecking API health...\x1b[0m\r\n');
          const response = await axios.get(`${API_BASE_URL}/health`);
          term.writeln(`\x1b[32mAPI Status: ${JSON.stringify(response.data)}\x1b[0m`);
          
          // Check if server API key is set
          if (response.data.server_api_key_set) {
            term.writeln('\x1b[32mServer API key is configured. You can use chat without setting your own key.\x1b[0m');
          } else {
            term.writeln('\x1b[33mNo server API key detected. You will need to set your own key with the setkey command.\x1b[0m');
          }
        } catch (error) {
          term.writeln(`\x1b[31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`);
        }
        break;
        
      case 'chat':
        if (!apiKey) {
          try {
            // Check if server has API key
            const healthCheck = await axios.get(`${API_BASE_URL}/health`);
            if (!healthCheck.data.server_api_key_set) {
              term.writeln('\x1b[31mError: API key not set. Use "setkey <your_api_key>" first.\x1b[0m');
              break;
            }
            // Server has API key, can proceed
          } catch (error) {
            term.writeln('\x1b[31mError checking server status. Use "setkey <your_api_key>" to set your own key.\x1b[0m');
            break;
          }
        }
        
        if (!args) {
          term.writeln('\x1b[31mError: Message required. Usage: chat <message>\x1b[0m');
          break;
        }
        try {
          term.write('\x1b[33mSending message to AI...\x1b[0m\r\n');
          
          // Make streaming request to the API
          const response = await axios.post(
            `${API_BASE_URL}/chat`, 
            {
              developer_message: "You are an AI assistant in a Matrix-style terminal. Keep responses concise and slightly dramatic.",
              user_message: args,
              api_key: apiKey // This will be undefined if using server key
            },
            {
              responseType: 'stream'
            }
          );
          
          // Handle streaming response
          for await (const chunk of response.data) {
            const text = new TextDecoder().decode(chunk);
            term.write('\x1b[32m' + text + '\x1b[0m');
          }
          term.write('\r\n');
        } catch (error) {
          term.writeln(`\x1b[31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1b[0m`);
        }
        break;
        
      case 'setkey':
        setIsPasswordMode(true);
        if (!args) {
          term.writeln('\x1b[31mError: API key required. Usage: setkey <your_api_key>\x1b[0m');
          setIsPasswordMode(false);
          break;
        }
        setApiKey(args);
        term.writeln('\x1b[32mAPI key set successfully.\x1b[0m');
        setIsPasswordMode(false);
        break;
        
      case 'clear':
        term.clear();
        break;
        
      case 'help':
        term.writeln('\x1b[32mAvailable commands:\x1b[0m');
        term.writeln('\x1b[32m  health                - Check API health and key status\x1b[0m');
        term.writeln('\x1b[32m  chat <message>        - Send a message to the AI\x1b[0m');
        term.writeln('\x1b[32m  setkey <api_key>      - Set your OpenAI API key\x1b[0m');
        term.writeln('\x1b[32m  clear                 - Clear the terminal\x1b[0m');
        term.writeln('\x1b[32m  help                  - Show this help message\x1b[0m');
        break;
        
      case '':
        // Just a new line, do nothing
        break;
        
      default:
        term.writeln(`\x1b[31mCommand not recognized: ${cmd}\x1b[0m`);
        term.writeln('\x1b[32mType "help" for available commands.\x1b[0m');
    }
    
    // Show prompt again
    term.write('\x1b[32m> \x1b[0m');
  }, [term, apiKey]);
  
  // Function to display welcome message with Matrix-style typing effect
  const displayWelcomeMessage = useCallback((terminal: Terminal) => {
    const welcomeMessage = [
      '█▀▄▀█ ▄▀█ ▀█▀ █▀█ █ ▀▄▀   ▀█▀ █▀▀ █▀█ █▀▄▀█ █ █▄░█ ▄▀█ █░░',
      '█░▀░█ █▀█ ░█░ █▀▄ █ █░█   ░█░ ██▄ █▀▄ █░▀░█ █ █░▀█ █▀█ █▄▄',
      '',
      'Welcome to the Matrix Terminal Interface',
      'Connected to FastAPI Backend at ' + API_BASE_URL,
      '',
      'Type "health" to check connection and API key status',
      '',
      'Available commands:',
      '  health                - Check API health and key status',
      '  chat <message>        - Send a message to the AI',
      '  setkey <api_key>      - Set your OpenAI API key',
      '  clear                 - Clear the terminal',
      '  help                  - Show this help message',
      '',
      'Type a command to begin...',
      '',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < welcomeMessage.length) {
        terminal.writeln('\x1b[32m' + welcomeMessage[i] + '\x1b[0m');
        i++;
      } else {
        clearInterval(interval);
        terminal.write('\x1b[32m> \x1b[0m');
      }
    }, 100);
  }, []);
  
  // Register client-side only
  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup function
    return () => {
      if (term) {
        term.dispose();
      }
      setIsMounted(false);
    };
  }, []);

  // Initialize terminal on component mount
  useEffect(() => {
    if (!isMounted || !terminalRef.current) return;
    
    // Clean up any existing terminal
    if (term) {
      term.dispose();
    }
    
    try {
      // Create new terminal with Matrix styling
      const newTerm = new Terminal({
        cursorBlink: true,
        fontSize: 16,
        fontFamily: 'Courier New, monospace',
        theme: {
          background: MATRIX_BG,
          foreground: MATRIX_GREEN,
          cursor: MATRIX_GREEN,
          selectionBackground: MATRIX_GREEN,
          selectionForeground: MATRIX_BG,
        },
        allowTransparency: true,
      });
      
      // Add addons
      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      newTerm.loadAddon(fitAddon);
      newTerm.loadAddon(new WebLinksAddon());
      
      // Open terminal in the container
      newTerm.open(terminalRef.current);
      
      // Set up key event handlers
      newTerm.onKey(({ key, domEvent }) => {
        // Handle Enter key
        if (domEvent.keyCode === 13) { // Enter key
          newTerm.write('\r\n');
          handleCommand(inputBuffer);
          setInputBuffer('');
          return;
        }
        
        // Handle Backspace
        if (domEvent.keyCode === 8) {
          if (inputBuffer.length > 0) {
            setInputBuffer(prev => prev.slice(0, -1));
            newTerm.write('\b \b'); // Erase the character
          }
          return;
        }
        
        // Add character to input buffer
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        if (printable) {
          setInputBuffer(prev => prev + key);
          
          // In password mode, show * instead of actual character
          if (isPasswordMode) {
            newTerm.write('*');
          } else {
            newTerm.write(key);
          }
        }
      });
      
      // Save terminal reference
      setTerm(newTerm);
      
      // Fit terminal to container
      setTimeout(() => {
        if (fitAddonRef.current) {
          try {
            fitAddonRef.current.fit();
          } catch (e) {
            console.error("Error fitting terminal:", e);
          }
        }
        
        // Display welcome message
        displayWelcomeMessage(newTerm);
      }, 100);
      
      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          try {
            fitAddonRef.current.fit();
          } catch (e) {
            console.error("Error fitting terminal on resize:", e);
          }
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        newTerm.dispose();
      };
    } catch (error) {
      console.error("Error initializing terminal:", error);
    }
  }, [displayWelcomeMessage, handleCommand, isMounted, isPasswordMode, term]);
  
  // Matrix rain effect CSS
  const matrixStyle = {
    position: 'relative' as const,
    height: '100vh',
    width: '100%',
    backgroundColor: MATRIX_BG,
    overflow: 'hidden',
  };
  
  const terminalContainerStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    backgroundColor: MATRIX_BG,
    border: `1px solid ${MATRIX_GREEN}`,
    boxShadow: `0 0 10px ${MATRIX_GREEN}, 0 0 20px ${MATRIX_GREEN}`,
    zIndex: 1000,
    padding: '10px',
    borderRadius: '5px',
  };

  return (
    <div style={matrixStyle}>
      <div ref={terminalRef} style={terminalContainerStyle} />
    </div>
  );
} 