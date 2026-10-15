"""API endpoints for Voice Assistant."""

import logging
import os
import re
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import FileResponse
from agents import Runner
from agents.items import ToolCallOutputItem

from app.agent.agent import run_voice_agent_async, agent
from app.api.schemas import ChatRequest, ChatResponse, TTSRequest
from app.services.tts import text_to_speech, DEFAULT_VOICE_EN

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Voice Assistant"])


def cleanup_temp_file(file_path: str) -> None:
    """Safely delete temporary audio file after response is streamed."""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.debug(f"Cleaned up temporary file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to remove temporary file {file_path}: {e}")


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with Voice Assistant",
    description="Processes user text or voice transcript and returns the agent's spoken reply.",
)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Receive user message, invoke Voice Assistant agent, and return reply."""
    try:
        clean_msg = request.message.strip()
        if request.history:
            # Use last 10 turns of history for multi-turn conversation memory
            recent_history = [
                {"role": m.role, "content": m.content}
                for m in request.history[-10:]
            ]
            agent_input = recent_history + [{"role": "user", "content": clean_msg}]
        else:
            agent_input = clean_msg

        result = await Runner.run(agent, agent_input)
        reply = result.final_output if hasattr(result, "final_output") else str(result)
        reply = (reply or "").strip() or "I processed your request, but have no spoken response."

        # Scan tool outputs to find any YouTube URL returned by play_music
        music_url: str | None = None
        for item in getattr(result, "new_items", []):
            if isinstance(item, ToolCallOutputItem):
                output_text = str(item.output)
                match = re.search(r"https?://(?:www\.)?youtube\.com/\S+", output_text)
                if match:
                    music_url = match.group(0)
                    break

        return ChatResponse(reply=reply, status="success", music_url=music_url)
    except Exception as e:
        logger.error(f"Error in /chat endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}",
        )


@router.post(
    "/tts",
    summary="Generate Text-to-Speech Audio",
    description="Synthesizes text into high-quality speech using edge-tts and streams back MP3 audio.",
)
async def tts_endpoint(
    request: TTSRequest,
    background_tasks: BackgroundTasks,
) -> FileResponse:
    """Generate MP3 audio from text and stream as FileResponse."""
    try:
        voice = request.voice if request.voice else DEFAULT_VOICE_EN
        audio_path = await text_to_speech(
            text=request.text,
            voice=voice,
            lang=request.lang,
        )

        # Schedule automatic cleanup of temporary audio file
        background_tasks.add_task(cleanup_temp_file, audio_path)

        return FileResponse(
            path=audio_path,
            media_type="audio/mpeg",
            filename="speech.mp3",
            headers={"Content-Disposition": "inline; filename=speech.mp3"},
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Error in /tts endpoint: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech synthesis failed: {str(e)}",
        )
