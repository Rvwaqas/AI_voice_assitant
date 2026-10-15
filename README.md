# AI Voice Assistant (Alexa-Style)

A production-quality, responsive voice assistant built with **OpenAI Agents SDK**, **Groq (Qwen 2.5)**, **Next.js**, and **FastAPI**.

## Features

- **Voice & Text Chat**: Hands-free real-time voice recognition using Web Speech API & Edge TTS with natural conversation flow.
- **ChatGPT-Style Multi-Turn Memory**: Back-and-forth conversational dialogue with context awareness.
- **Tools**:
  - `play_music`: Automatically searches and opens songs on YouTube with dedicated music cards.
  - `get_current_time`: Local time and date query.
  - `web_search`: Real-time internet search via DuckDuckGo.
- **Bilingual**: Supports English & Urdu (اردو / Roman Urdu).

## Setup & Running

### Backend (FastAPI)
```bash
cd voice-assistant/backend
pip install -r requirements.txt
# Set GROQ_API_KEY in .env
python -m uvicorn app.main:app --port 8000
```

### Frontend (Next.js)
```bash
cd voice-assistant/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
