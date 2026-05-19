# PrePrompt

[**Live demo: pre-prompt.vercel.app**](https://pre-prompt.vercel.app/)

**PrePrompt** is a **pre-AI cognitive layer**: a structured thinking protocol you complete _before_ you send work to an LLM or agent. The goal is to cut wasted tokens, reduce over-generation and scope drift, and keep you in control of what the model is asked to do.

---

## What you get in the app

| Area | Route | Role |
|------|--------|------|
| **Harness** (five stages + live preview) | `/` | Capture a natural-language draft, optionally run **Auto-Structure** into a deep plan and five slots, then compile a handoff-ready prompt. |
| **Result** | `/result` | Review the compiled prompt, exports, and optional **save to server** for shared history. |
| **History** | `/history` | Browse and reload handoffs saved via the server file store. |
| **Playbook** | `/playbook` | Guided **harness** flow (wizard) aligned with playbook content and case matrix helpers. |
| **About** | `/about` | Project context. |

State for the harness (fields, deep plan, provider choice, non-secret preferences) persists in the browser via **Zustand** + `localStorage` unless you explicitly save a snapshot to the server from the result page.

---

## Privacy and where data goes

- **Drafts and structured fields** live in the browser by default. Clearing site data or switching browsers can require re-entering secrets.
- **Gemini Auto-Structure** uses your **Google Generative Language API key** in requests to **`/api/gemini`**, which forwards to Google. The key passes through the server process for the duration of the request; this codebase does not persist API keys to disk. On any hosted deployment you do not fully control, treat the server as a relay: use restricted keys and avoid production secrets.
- **Cursor Agent Auto-Structure** uses **`/api/cursor-agent`**, which shells out to the local [**Cursor Agent CLI**](https://docs.cursor.com/cli) (`cursor-agent`). That path is intended for **machines where the CLI is installed and authenticated** (typically local development). It is not a generic cloud substitute for Gemini on serverless hosts.
- **Shared handoff history** (`/history`, `/api/handoff-history`): when you save from the result page, a JSON snapshot of harness fields and deep plan (not your API key) is written to **`.data/handoff-history.json`** on the Node host running Next.js. This works on a normal long-lived Node process (`next dev` / `next start`). Many **serverless** platforms do not offer durable writable local disk per region; if saves fail with **503**, use a VM or self-hosted Node, or replace the file store with a database.

---

## The five-stage protocol

Each slot is a different kind of information (no overlap). Internal field names stay stable for persistence:

1. **Success criteria** (`intentLock`) — Observable signals that prove you are done.
2. **Ground truth** (`realityAnchor`) — Facts and assumptions about the repo and environment _today_.
3. **Hard rules** (`constraintCage`) — Non-negotiables for the work (MUST / MUST NOT), not reply formatting.
4. **Handoff scope** (`actionSlice`) — What this handoff covers vs explicitly deferred; not “your next chat turn.”
5. **Output format** (`responseContract`) — Shape of the model’s reply only (sections, fences, brevity).

More philosophy and research notes live in [`docs/preprompt.md`](docs/preprompt.md).

---

## Repository layout

```text
src/
  app/                    # Next.js App Router pages and route handlers
    page.tsx              # Harness home
    result/, history/, about/, playbook/
    api/
      gemini/             # Google Gemini proxy for Auto-Structure
      cursor-agent/       # Local cursor-agent CLI proxy (+ models route)
      handoff-history/    # File-backed shared history CRUD + download
  components/             # UI: stages, preview, settings, playbook wizard, exports
  lib/
    agent/                # Orchestration: Gemini, Cursor agent, prompt generation
    playbook/             # Playbook session, matrix, natural-prompt draft helpers
    server/               # handoff history store, rate limits, optional QA logging
    i18n*.ts              # UI strings (harness + playbook); handoff archetypes live in i18n.harness.ts
  store/usePromptStore.ts # Zustand store + persistence
  prompts/                # Orchestration copy + deep-plan JSON schema
public/                   # Static assets (images, icons)
docs/                     # Benchmarks, progress notes, preprompt spec, case matrix
scripts/                  # Optional maintenance scripts (e.g. extract-handoff-ko.py)
```

---

## Tech stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **UI**: React 19, [Tailwind CSS](https://tailwindcss.com/) 4, [Radix UI](https://www.radix-ui.com/) primitives, shadcn-style components under `src/components/ui/`
- **State**: [Zustand](https://github.com/pmndrs/zustand) 5 with `persist` middleware
- **Language**: TypeScript 6

---

## Getting started

```bash
git clone https://github.com/inxnxng/PrePrompt.git
cd PrePrompt
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other useful scripts: `npm run build`, `npm start`, `npm run lint`.

---

## Docs and maintenance scripts

- **`docs/`** — Benchmark write-ups, playbook case matrix, repository notes, and the long-form preprompt specification.
- **`scripts/`** — Optional local tooling. Run or inspect scripts before executing; some expect local paths or Python/Node on your machine.

---

## Screenshots

### Usage demo

![PrePrompt usage demo](./public/demo.webp)

### Compiled prompt preview

![PrePrompt screenshot](./public/screenshot.png)

---

## Why this exists

LLM-native dev tools are powerful but often encourage vague prompts, runaway generation, and expensive iteration. PrePrompt is an experimental surface for **human–AI interface design**: structured cognition before model calls, with an eye toward **token-efficient** collaboration. See **`docs/`** for measurement-oriented notes where available.
