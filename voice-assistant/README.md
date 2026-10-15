# AI Voice Assistant (Alexa-like)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4.svg?logo=google&logoColor=white)](https://aistudio.google.com)
[![OpenAI Agents SDK](https://img.shields.io/badge/OpenAI-Agents_SDK-412991.svg?logo=openai&logoColor=white)](https://github.com/openai/openai-agents-python)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

A modern, production-grade AI Voice Assistant inspired by Amazon Alexa. It features speech recognition, natural conversational interaction in both **English and Urdu**, real-time tool calling (current time, live web search, and music streaming), high-quality neural voice synthesis, and an Alexa-like glowing dark UI.

---

## Key Highlights

- **Official OpenAI Agents SDK**: Uses `openai-agents` orchestrated with Google Gemini's OpenAI-compatible endpoint.
- **Free Google Gemini LLM**: Utilizes `gemini-2.0-flash` (or `gemini-1.5-flash`) for low-latency, conversational spoken responses.
- **Zero-Cost Industrial Tools**:
  - **Time & Date Tool**: Reports accurate local time and date.
  - **DuckDuckGo Web Search Tool**: Real-time information querying with zero API fees.
  - **YouTube Music Tool**: Plays requested songs and tracks directly via YouTube search links.
- **Bi-Directional Voice Pipeline**:
  - **Speech-to-Text (STT)**: Browser Web Speech API (`SpeechRecognition`) for immediate, client-side transcription without audio upload delays.
  - **Text-to-Speech (TTS)**: Microsoft Edge neural voices (`edge-tts`) featuring natural Urdu (`ur-PK-UzmaNeural`) and English (`en-US-AriaNeural`) voices with automated file cleanup.
- **Alexa-Inspired Dark UI**: Next.js 15 App Router interface with responsive pulsating microphone rings, audio waves, transcript cards, audio replays, and manual keyboard fallback.

---

## Project Structure

```
voice-assistant/
├── README.md                           # Documentation and setup guide
├── .env.example                        # Template for environment variables
├── .gitignore                          # Git ignore rules for Python & Node
├── backend/                            # FastAPI backend service
│   ├── pyproject.toml                  # Project metadata and dependencies
│   ├── requirements.txt                # Pip requirements
│   └── app/
│       ├── __init__.py
│       ├── main.py                     # FastAPI application, CORS, health endpoints
│       ├── config.py                   # Pydantic Settings and .env management
│       ├── agent/
│       │   ├── __init__.py
│       │   ├── agent.py                # VoiceAssistant agent definition & Runner
│       │   └── tools.py                # get_current_time, web_search, play_music
│       ├── services/
│       │   ├── __init__.py
│       │   └── tts.py                  # edge-tts neural voice generation & cleanup
│       └── api/
│           ├── __init__.py
│           ├── routes.py               # POST /chat and POST /tts routes
│           └── schemas.py              # Pydantic models for chat and TTS
└── frontend/                           # Next.js 15 frontend application
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── app/
    │   ├── layout.tsx                  # HTML layout and metadata
    │   ├── page.tsx                    # Main interactive voice page
    │   └── globals.css                 # Radial gradients, pulse & ring animations
    ├── components/
    │   ├── MicButton.tsx               # Alexa pulsating circular microphone button
    │   ├── TranscriptCard.tsx          # Real-time spoken speech card
    │   └── ReplyCard.tsx               # Assistant response card with audio controls
    └── lib/
        └── api.ts                      # Typed client for backend communication
```

---

## How to Get a Free Gemini API Key

1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key**.
4. Select or create a Google Cloud Project and copy the generated key.

---

## Step-by-Step Installation & Setup

### 1. Environment Configuration

From the root directory (`voice-assistant/`):

```bash
# Copy the example environment file
cp .env.example .env
```

Open `.env` in any text editor and insert your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

---

### 2. Backend Setup & Run

Open a terminal window and navigate to the backend directory:

```bash
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# On Windows (PowerShell):
.venv\Scripts\activate
# On Windows (Command Prompt):
# .venv\Scripts\activate.bat
# On macOS / Linux:
# source .venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend server will start at:
- **Base URL**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/health`

---

### 3. Frontend Setup & Run

Open a second terminal window and navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

*(Recommended browsers: Google Chrome, Microsoft Edge, or Safari for native Web Speech API support).*

---

## Example Voice Commands to Try

| Category | English Voice Command | Urdu Voice Command | Tool Used |
| :--- | :--- | :--- | :--- |
| **Time & Date** | *"What time is it right now?"* | *"Abhi kya waqt ho raha hai?"* | `get_current_time` |
| **Web Search** | *"Search for the latest AI news"* | *"Pakistan ke mausam ka haal search karo"* | `web_search` |
| **Music Playback** | *"Play Shape of You by Ed Sheeran"* | *"Atif Aslam ka gaana chalao"* | `play_music` |
| **General Knowledge** | *"Who was Albert Einstein?"* | *"Duniya ka sab se ooncha pahaar kaun sa hai?"* | Gemini 2.0 Flash |
| **Conversational** | *"How are you doing today?"* | *"Aap kaun hain aur kya kar sakte hain?"* | Spoken conversational reply |

---

## Troubleshooting & FAQ

1. **Microphone is not listening**:
   - Ensure you are using Google Chrome or Microsoft Edge.
   - Click the lock/tune icon next to the address bar in your browser and allow Microphone access for `http://localhost:3000`.
2. **Backend shows Offline**:
   - Verify that your FastAPI server is running on port 8000 (`http://localhost:8000/health`).
   - Check that `.venv` is activated and `uvicorn` has started without errors.
3. **Audio autoplay does not play automatically**:
   - Some browsers restrict audio autoplay until the user interacts with the page. Clicking the microphone button counts as interaction, but if blocked, you can click the **"Replay"** button on the reply card at any time.

---

## License

This project is licensed under the MIT License.
