# Skill: AI Voice Assistant (Alexa-like)  
**OpenAI Agents SDK + Free Gemini API + Next.js + FastAPI**

## Skill Purpose
This skill guides an AI coding agent (Antigravity, Cursor, Claude, Windsurf, etc.) to build a **production-quality voice assistant** similar to Alexa that:

- Understands voice commands
- Tells the current time
- Searches the web (free DuckDuckGo)
- Plays music (YouTube search)
- Uses **OpenAI Agents SDK** with **free Gemini API key**
- Has a modern Next.js frontend
- Has a clean FastAPI backend
- Follows industrial / senior-developer standards

## Final Goal
A working project where the user can:
1. Click a microphone button
2. Speak in Urdu or English
3. Get a spoken reply from the assistant
4. Use tools: time, web search, play music

---

## Exact Project Structure (Do NOT change)

```
voice-assistant/
├── README.md
├── .env.example
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry + CORS
│   │   ├── config.py               # pydantic-settings
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py            # Main Agent definition
│   │   │   └── tools.py            # get_current_time, web_search, play_music
│   │   ├── services/
│   │   │   ├── stt.py              # (optional local STT)
│   │   │   └── tts.py              # edge-tts
│   │   └── api/
│   │       ├── routes.py
│   │       └── schemas.py
│   ├── requirements.txt
│   └── pyproject.toml              # preferred
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Main Voice UI
│   │   └── globals.css
│   ├── components/
│   │   ├── MicButton.tsx
│   │   ├── TranscriptCard.tsx
│   │   └── ReplyCard.tsx
│   └── lib/
│       └── api.ts
└── docs/
```

---

## Technology Stack (Strict)

| Layer          | Technology                          | Reason |
|----------------|-------------------------------------|------|
| Agent Framework| `openai-agents`                     | Official OpenAI Agents SDK |
| LLM            | Gemini free (`gemini-2.0-flash` or `gemini-1.5-flash`) | Free + excellent quality |
| Gemini Connection | OpenAI-compatible endpoint (Panaversity style) | Works perfectly with Agents SDK |
| Backend        | FastAPI + uvicorn                   | Async, production ready |
| Frontend       | Next.js 15 (App Router) + Tailwind  | Modern UI |
| STT            | Browser Web Speech API              | Free, zero latency |
| TTS            | `edge-tts`                          | Free high-quality neural voices (Urdu + English) |
| Search         | `duckduckgo-search`                 | Completely free |
| Music          | YouTube search URL                  | Simple & reliable |

---

## Critical Code Patterns (Must Follow)

### 1. Gemini + OpenAI Agents SDK Setup (from Panaversity)

```python
import os
from dotenv import load_dotenv
from agents import (
    Agent,
    Runner,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    function_tool,
    set_tracing_disabled,
)

load_dotenv()
set_tracing_disabled(disabled=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

external_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url=BASE_URL,
)

model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",          # or "gemini-1.5-flash"
    openai_client=external_client,
)
```

### 2. Tools (Industrial Style)

```python
from agents import function_tool
from datetime import datetime
from duckduckgo_search import DDGS

@function_tool
def get_current_time() -> str:
    """Returns the current local time and date in a human-readable format."""
    return datetime.now().strftime("%I:%M %p on %A, %d %B %Y")

@function_tool
def web_search(query: str) -> str:
    """Search the internet for real-time information using DuckDuckGo."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=4))
        if not results:
            return "No results found."
        formatted = []
        for r in results:
            formatted.append(f"• {r['title']}: {r['body'][:180]}...")
        return "\n".join(formatted)
    except Exception as e:
        return f"Search failed: {str(e)}"

@function_tool
def play_music(song_name: str) -> str:
    """Play a song by generating a YouTube search link."""
    query = song_name.replace(" ", "+")
    url = f"https://www.youtube.com/results?search_query={query}"
    return f"Playing '{song_name}'. Open this link: {url}"
```

### 3. Agent Definition

```python
agent = Agent(
    name="VoiceAssistant",
    instructions="""
You are a helpful, friendly voice assistant like Alexa.
- Keep answers short, natural and conversational (spoken style).
- Always use the available tools when the user asks for time, search, or music.
- Respond in the same language the user is speaking (Urdu or English).
- Be polite and helpful.
""",
    model=model,
    tools=[get_current_time, web_search, play_music],
)
```

### 4. Running the Agent

```python
result = Runner.run_sync(agent, user_message)
reply = result.final_output
```

---

## Backend Requirements

- FastAPI with proper CORS for `http://localhost:3000`
- Endpoints:
  - `POST /chat` → text in → agent reply out
  - `POST /tts` → text → mp3 audio (edge-tts)
- Use `pydantic-settings` for config
- Environment variable: `GEMINI_API_KEY`
- Clean error handling and logging

## Frontend Requirements

- Beautiful dark gradient UI (Alexa-like)
- Large circular microphone button with recording animation
- Show transcript + assistant reply
- Auto-play TTS audio after receiving reply
- Use Web Speech API (`SpeechRecognition`)
- Language support: `ur-PK` + `en-US`

## Voice Flow (Must Implement)

1. User clicks Mic → Browser starts listening
2. Speech → transcript
3. Transcript sent to `POST /chat`
4. Backend runs Agent → returns text reply
5. Frontend calls `POST /tts` with reply
6. Backend generates MP3 with edge-tts
7. Frontend plays the audio

---

## Implementation Order (Strict)

1. Create backend folder structure
2. Create `.env.example` and config
3. Implement tools.py
4. Implement agent.py
5. Implement FastAPI routes (chat + tts)
6. Create frontend with Next.js
7. Build beautiful Mic UI
8. Connect frontend ↔ backend
9. Test all three tools + voice
10. Write clear README with setup instructions

---

## Extra Quality Rules (Senior Developer Level)

- Type hints everywhere
- Docstrings on all tools and important functions
- Proper error handling (try/except)
- No hardcoded secrets
- Clean imports
- Consistent naming
- Good README with:
  - How to get Gemini API key
  - How to run backend
  - How to run frontend
  - Example voice commands

---

## Example Voice Commands to Support

- "What time is it?" / "Abhi kitne baje hain?"
- "Search for latest AI news"
- "Play Shape of You" / "Ed Sheeran ka gaana chalao"
- "Who is the prime minister of Pakistan?"

---

## Final Deliverable

A fully working project that the user can run with:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 and talk to the assistant.

---

**End of Skill**
```
