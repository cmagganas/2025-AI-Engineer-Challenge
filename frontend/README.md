# 🔥 Matrix Terminal Frontend 🔥

Welcome to the coolest terminal on the web! This Matrix-inspired interface lets you interact with the FastAPI backend in style. Just like Neo, you'll feel like a hacker while chatting with AI.

## 🚀 Features

- **Matrix Rain Effect**: Feel like you're in the digital realm with our authentic green Matrix code rain
- **Terminal Interface**: Type commands to interact with the backend API
- **AI Chat**: Talk to an AI assistant with streaming responses (requires OpenAI API key)
- **Secure Password Fields**: Enter sensitive info with hidden characters (for API keys)
- **Responsive Design**: Looks awesome on any device

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ (LTS version recommended)
- npm or yarn

### Installation

```bash
# Clone the repo (if you haven't already)
git clone <your-repo-url>
cd your-project-name/frontend

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and watch the Matrix come alive!

### Available Commands

When the Matrix Terminal loads, you can use these commands:

```
health                - Check API health
chat <message>        - Send a message to the AI
setkey <api_key>      - Set your OpenAI API key
clear                 - Clear the terminal
help                  - Show this help message
```

## 🚢 Deployment

This frontend is designed to be deployed on Vercel alongside the FastAPI backend.

```bash
# Deploy to production
vercel --prod
```

## 🔮 Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_API_BASE_URL=/api
```

For production, set this up in your Vercel environment variables.

## 🧪 Tech Stack

- **Next.js**: React framework with server components
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling
- **xterm.js**: For terminal emulation
- **Axios**: For API requests

Hack the planet! 🌐
