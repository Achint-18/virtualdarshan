# 🪔 Bappa Darshan

A virtual Ganpati Darshan + Aarti + optional Seva experience.

## Structure
- `frontend/` Vite + React + TypeScript PWA
- `backend/` FastAPI + MongoDB
- `frontend/public/audio/aarti.mp3` copyright-free Aarti audio supplied for the project
- `frontend/public/images/` supplied Ganpati artwork

## Run
### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

For local development, Vite proxies `/api` to the backend. Production deployments should use the same-origin `/api` paths through the configured reverse proxy/host.

## Aarti
The project now uses the supplied copyright-free `aarti.mp3`. The Aarti page waits for a Start tap, plays the recording, and synchronizes the displayed lyrics from the audio playback clock. The opening instrumental section is treated as a short intro; the final instrumental tail is left without changing the last lyric. If the recording cannot be decoded, the UI falls back to synthesized temple bell + tanpura audio.
