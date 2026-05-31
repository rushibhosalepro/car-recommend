# Car Recommendation Assistant

A focused MVP that helps car buyers cut through indecision — answer five questions, get three AI-matched recommendations from a real catalog.

## What I built

A preference-driven recommendation flow with a clean separation of concerns:

- a five-step wizard that collects budget, fuel type, use case, seating, and must-have features,
- a backend API that packages those preferences into an AI agent context,
- a tool-enabled semantic search over a structured car catalog using Elastic,
- a results page that surfaces the top three matches with ranked explanations.

Scoped deliberately as a decision-support tool, not a marketplace.

### Deliberate cuts

- no user accounts or saved preferences,
- no live dealer inventory or pricing integration,
- no financing calculator,

## Tech stack

| Layer    | Choice                   | Why                                                                                      |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| Frontend | React + Vite + Tailwind  | Fast iteration, strong TypeScript support, minimal setup                                 |
| Backend  | Bun + Express            | Simple API surface, fast cold start, native TypeScript execution                         |
| AI       | OpenRouter + Elastic MCP | Agent reasons over preferences; tool-enabled search grounds results in real catalog data |

## AI-assisted vs manual work

### Delegated to AI

- prompt design and iterative review of the system prompt,
- repo-wide inspection to identify structural inconsistencies,
- first-pass README and run instruction drafting.

### Done by hand

- wired the full preference wizard to the backend recommendation endpoint,
- diagnosed and fixed an environment variable mismatch (`KIBANA_URL` vs `ELASTIC_URL`) that would have silently broken catalog search,
- audited backend agent code to confirm assumptions about external infrastructure before trusting generated output.

### Where AI helped most

Navigating an unfamiliar repo quickly — understanding the structure, surfacing config gaps, and turning a rough working state into something coherent and documented.

### Where I had to be careful

The repo contains secret-backed local env files. AI-generated suggestions had to be manually verified before use to avoid leaking real credentials. Similarly, the agent code assumes live Elastic and OpenRouter infrastructure, so I confirmed runtime expectations rather than relying on generated assumptions.

## Running locally

### Backend

```bash
cd backend
bun install
cp .env.example .env
# set OPENROUTER_API_KEY, ELASTIC_URL, and ELASTIC_API_KEY in backend/.env
```

Seed the Elastic index with the car catalog (only needed once):

```bash
bun run elastic-push
```

Then start the dev server:

```bash
bun run dev
```

### Frontend

```bash
cd fe
bun install
cp .env.example .env
bun dev
```

Open `http://localhost:5173`.

## What I'd do with another 4 hours

- add inline explanation cards on the results page — why each car was ranked where it was, with specific callouts to the user's stated priorities,
- build a lightweight side-by-side comparison view with pros, cons, and price context for each recommendation.
