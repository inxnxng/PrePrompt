# PrePrompt 💬

[**Live Demo: pre-prompt.vercel.app**](https://pre-prompt.vercel.app/)

**PrePrompt** is a Pre-AI Cognitive Layer—a structured thinking protocol you pass through _before_ sending a request to an AI system. It is designed to reduce token usage, prevent AI over-generation, and give you back control over your AI outputs.

## 🔒 Privacy & Token Security

Your drafts, structured fields, and generated **deep plan** stay in this browser (local storage). **The app does not persist your Gemini API key or prompts on a server.**

**Auto-Structure** sends your key and prompt text to **your deployment's** `/api/gemini` route, which forwards the request to Google's Generative Language API and returns the model output. That means the key **transits the server process memory for the duration of the request** (it is not written to a database by this codebase). Treat hosted deployments like any other third-party relay: use a restricted key and avoid production secrets if you do not trust the environment.

Because storage is local-only, **you may need to re-enter your API key** after clearing site data or switching browsers.

## 🌟 The AI Collaboration Protocol

This application guides you through five mandatory thinking stages to construct an optimal prompt (each slot is a different kind of information—no overlap):

1. **Success criteria**: Observable signals that prove you are done (not facts, rules, scope, or reply layout).
2. **Ground truth**: Facts and assumptions about the repo and environment today (not goals, rules, or how the model should talk).
3. **Hard rules**: Non-negotiables for the work itself—MUST / MUST NOT (not message formatting).
4. **Handoff scope**: What this single structured prompt covers vs explicitly deferred; harness or sub-agents subdivide internally—this is not “your next chat turn.”
5. **Output format**: Shape of the model's reply only (sections, fences, brevity).

Internal field names in code remain `intentLock`, `realityAnchor`, `constraintCage`, `actionSlice`, `responseContract` for persistence compatibility.

## 📸 Screencast & Screenshots

### Usage Demo

Here is a quick walkthrough of filling out the 5-stage UI to generate a structured prompt.

![PrePrompt Usage Demo](./public/demo.webp)

### Compiled Prompt Preview

Your inputs are automatically compiled into a clean, structured prompt ready for Cursor, Claude, or ChatGPT.

![PrePrompt Screenshot](./public/screenshot.png)

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & shadcn/ui
- **State Management**: Zustand
- **Language**: TypeScript

## 📦 Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔬 Motivation & Research

Modern LLM-based development tools provide powerful generation capabilities but often lead to scoping drift and repetition. PrePrompt acts as an experimental proof-of-concept for:

- Human-AI interface design.
- Structured cognition before LLM interaction.
- Token-efficient collaboration models.



