# ZeroFill Frontend

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

## 📚 Feature Docs & Workstreams

### A3: Embed Widget Hardening (Shipped)
- `docs/EMBED_DEVELOPER_DOCS.md` — entry point for all embed docs
- `docs/EMBED_INSTALL_NEXTJS.md` — Next.js install guide
- `docs/EMBED_INSTALL_REACT_SPA.md` — React SPA install guide
- `docs/EMBED_INSTALL_WORDPRESS.md` — WordPress install guide
- `docs/EMBED_INSTALL_SHOPIFY.md` — Shopify install guide
- `docs/EMBED_TROUBLESHOOTING_MATRIX.md` — failure diagnosis and fixes
- `docs/EMBED_TEST_CHECKLIST_AND_SNIPPETS.md` — sample snippets and test checklist
- `docs/EMBED_QA_VALIDATION_NOTES.md` — QA execution notes and pass template
- `docs/EMBED_DOCS_QA_RUN_LOG.md` — reusable QA run log for execution evidence
- `docs/A3_WORKSTREAMS_AND_TICKETS.md` — A3 streams, tickets, and risk matrix

### B1: Real-time WYSIWYG Split Builder (In Progress)
- `docs/B1_WYSIWYG_WORKSTREAMS_AND_TICKETS.md` — workstreams, 16 Jira tickets, risk matrix, sequencing

### B2: Context-Aware AI Follow-ups (Planned)
- `docs/B2_CONTEXT_AWARE_AI_FOLLOWUPS_WORKSTREAMS_AND_TICKETS.md` — workstreams, 16 Jira tickets, dependencies, sequencing

### C1: AI Sentiment & Summary Engine (Planned)
- `docs/C1_AI_SENTIMENT_SUMMARY_ENGINE_WORKSTREAMS_AND_TICKETS.md` — workstreams, Jira-ready tickets, caching/async controls, trust & safety

### C2: Deep Integration Ecosystem (Planned)
- `docs/C2_DEEP_INTEGRATION_ECOSYSTEM_WORKSTREAMS_AND_TICKETS.md` — subtasks + Jira tickets for webhooks, Zapier/Make, SLO, and delivery ops

### C3: Partial Response Recovery (Planned)
- `docs/C3_PARTIAL_RESPONSE_RECOVERY_WORKSTREAMS_AND_TICKETS.md` — workstreams, 16 Jira tickets, recovery metrics, abandoned lead reclamation, resume links, ROI tracking

## 📄 License
Private / Proprietary.
