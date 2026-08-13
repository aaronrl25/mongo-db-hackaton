# DevPersona

An adaptive voice coding workspace that learns how a developer likes to build, then retrieves that personality before every response.

## What is included

- React + TypeScript interface with voice workspace, personality dashboard, project memory, history, preference controls, and privacy settings
- Express API with provider adapters for OpenAI, MongoDB Atlas, and ElevenLabs Conversational AI
- Preference records with confidence, source, evidence, and global/project scope
- Deterministic precedence: current instruction → project preference → global preference
- Atlas Vector Search retrieval before generation
- Local demo store and realistic seed data when credentials are absent
- OpenAI preference extraction after each developer message

## Run it

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:8787`.

The UI works immediately in demo mode. Add credentials to `.env` to enable the live integrations.

## MongoDB Atlas

Use the database configured by `MONGODB_DB` (defaults to `devpersona`). DevPersona creates/uses these collections:

- `preferences`
- `memories`
- `messages`

Create an Atlas Vector Search index named `devpersona_vector_index` on `memories`:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "projectId"
    }
  ]
}
```

Embeddings use OpenAI `text-embedding-3-small`. If the index is still building or unavailable, memory retrieval safely falls back to recent project memories.

## ElevenLabs

Set `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` for the Conversational AI agent. The `/api/voice/session` adapter exposes the configured agent to the client without exposing the API key. The workspace uses the official `@elevenlabs/react` provider and session controls for full-duplex audio. Public agents connect by agent ID; production HTTPS is required for browser microphone access outside localhost.

Recommended agent system prompt:

> You are DevPersona, a voice coding partner. Keep voice replies brief. The application will provide resolved developer preferences and project memory. Always follow current instructions over project preferences, and project preferences over global preferences.

## Preference document shape

```ts
{
  category: string;
  label: string;
  value: string;
  confidence: number;        // 0..1
  scope: "global" | "project";
  projectId?: string;
  source: "explicit" | "inferred" | "imported";
  evidence: string;
  updatedAt: string;
}
```

Manual preferences start at 100% confidence. Inferred preferences retain the exact supporting evidence so users can inspect and remove them.

## Verification

```bash
npm run check
npm run build
```
