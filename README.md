# Formless Frontend

A modern, AI-powered conversational form platform built with Next.js. This application allows users to import forms from Google Forms and interact with them through a dynamic AI chat interface powered by Groq.

## 🚀 Key Features

- **Conversational AI Forms**: Transform static forms into interactive chat experiences.
- **Form Management**: Import, view, and manage your forms from a sleek dashboard.
- **Public Shareable Links**: Generate public links to share your AI chat forms with anyone.
- **Real-time Progress**: Visual progress tracking as users complete forms.
- **Responsive Design**: Premium dark-mode UI optimized for all devices.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Content Parsing**: [React Markdown](https://github.com/remarkjs/react-markdown)

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (Shadcn/UI based).
- `src/lib`: Core logic, API clients, and utilities.
- `src/hooks`: Custom React hooks for state and data fetching.
- `src/store`: Zustand stores for global state management.

## 📄 License
Private / Proprietary.
