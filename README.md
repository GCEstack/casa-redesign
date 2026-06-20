# Casa Redesign Frontend

A fresh mobile-first React + Vite frontend for **Casa Companion**. It connects to the **Casa Voice V3 Dual** backend for real-time voice conversations with characters.

## What this repo is

- **Frontend only** — React, TypeScript, Tailwind CSS, shadcn/ui components
- **Voice-first chat** — tap a character, talk or type, and Casa responds
- **Designed for phones** — PWA-style mobile layout with desktop backdrop

## What this repo is NOT

- The voice AI backend lives in the Casa Companion monorepo:
  - `Projects/ACTIVE/apps-platforms/casa-companion/voice/v3-dual`
- That repo contains the FastAPI server, WebSocket voice pipeline, STT/LLM/TTS providers, tests, and firmware.

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to point at your voice server. Default is local:
   ```
   VITE_VOICE_SERVER_URL=ws://localhost:8080/ws/voice
   ```

3. **Start the voice backend** (in the Casa Companion project)
   ```powershell
   cd "C:\Users\Dekan AI Brother\Projects\ACTIVE\apps-platforms\casa-companion\voice\v3-dual"
   uvicorn main:app --host 0.0.0.0 --port 8080
   ```

4. **Start the frontend**
   ```bash
   npm run dev
   ```

5. Open the local URL, pick a character, and talk.

## Deployment

This frontend builds to static files and can be deployed to Vercel, Netlify, Cloudflare Pages, etc.

```bash
npm run build
```

Make sure the deployed frontend points to a running Casa Voice backend via `VITE_VOICE_SERVER_URL`.

## Voice protocol

The frontend speaks the **Casa Voice V3 Dual** WebSocket protocol:

- Connects as `device_type=audio`
- Sends 16 kHz PCM audio from the mic
- Receives:
  - `state_change` → updates the mic/avatar UI
  - `transcript` → shows what the kid said
  - `assistant_text` → shows the character's reply
  - binary PCM → plays character voice audio
- Sends:
  - `text_input` → typed messages
  - `config_change` → character/mode changes
  - `command` → interrupt, reset, etc.

## Differences from the old voice agent

This frontend was previously wired to a different voice endpoint. It has been updated to use the local `voice/v3-dual` backend and protocol.

## Known integration notes

- Character and mode names flow through as strings. Some frontend `ConversationMode` values may not map 1:1 to backend voice tags yet — that mapping lives in `CharacterVoiceRouter` in the backend.
- For local development, use `ws://localhost:8080`. For HTTPS deployments, the voice backend must also be HTTPS (`wss://`).
