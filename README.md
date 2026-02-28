# PrePrompt

**PrePrompt** is a Pre-AI Cognitive Layer—a structured thinking protocol you pass through *before* sending a request to an AI system. It is designed to reduce token usage, prevent AI over-generation, and give you back control over your AI outputs.

## 🌟 The AI Collaboration Protocol

This application guides you through five mandatory thinking stages to construct an optimal prompt:

1. **Intent Lock**: Clearly define the desired end-state.
2. **Reality Anchor**: Explicitly describe the current system state.
3. **Constraint Cage**: Define non-negotiable boundaries.
4. **Action Slice**: Reduce the task to the smallest meaningful execution unit.
5. **Response Contract**: Specify output format requirements.

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
