# BlissAI Chatbot

A modern AI chat application built with Next.js, Prisma, and OpenAI. This application features authentication, chat history, and a sleek UI.

## Features

- **Authentication**: Secure login with Stack Auth
- **AI Chat**: Conversations with OpenAI's GPT-3.5 Turbo
- **Chat History**: Save and manage multiple conversations
- **Modern UI**: Clean, responsive design with animations
- **Database Integration**: Persistent storage with PostgreSQL and Prisma

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with Stack Auth
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stack Auth account
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL=your-postgresql-connection-string

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Stack Auth
STACK_AUTH_CLIENT_ID=your-stack-auth-client-id
STACK_AUTH_CLIENT_SECRET=your-stack-auth-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   npx prisma generate
   npx prisma db push
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Log in with your Stack Auth account
2. Create a new chat or select an existing one from the sidebar
3. Start chatting with the AI
4. Your conversations will be saved automatically
5. Delete chats when you no longer need them

## License

MIT
