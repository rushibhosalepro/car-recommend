# backend

This service exposes a single recommendation API used by the frontend.

## What it does

- Receives car preference context from the frontend.
- Uses an OpenRouter / OpenAI chat completion model.
- Calls an Elastic MCP tool to search the car catalog.
- Returns a clean JSON payload with the top 3 recommended cars.

## Setup

1. Copy the example file:

```bash
cd backend
cp .env.example .env
```

2. Fill in the required values in `backend/.env`:

- `OPENROUTER_API_KEY`
- `KIBANA_URL`
- `ELASTIC_API_KEY`

3. Install dependencies:

```bash
bun install
```

## Run locally

```bash
bun run --watch src/index.ts
```

The backend listens on port `3001` by default.

## Notes

- `backend/.env` is ignored by git.
- If you want to load the sample car catalog into Elastic, the `backend/src/elastic_search_script.ts` script can index the dataset.
- The frontend expects the backend URL to be available at `http://localhost:3001/api` by default.
