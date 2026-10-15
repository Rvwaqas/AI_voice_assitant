"""Text-to-Speech (TTS) Service using edge-tts.

Provides free high-quality neural voice synthesis for both English and Urdu.
"""

import logging
from pathlib import Path
import tempfile
import uuid
import edge_tts

logger = logging.getLogger(__name__)

DEFAULT_VOICE_EN = "en-US-AriaNeural"
DEFAULT_VOICE_UR = "ur-PK-UzmaNeural"


def is_urdu_text(text: str) -> bool:
    """Check if the text contains Urdu/Arabic Unicode characters."""
    return any("\u0600" <= char <= "\u06FF" for char in text)


async def text_to_speech(
    text: str,
    voice: str = DEFAULT_VOICE_EN,
    lang: str | None = None,
) -> str:
    """Convert text to speech and save as a temporary MP3 file.

    Args:
        text: The text to be synthesized into speech.
        voice: The edge-tts neural voice identifier (default: en-US-AriaNeural).
        lang: Optional language code ('ur' or 'en'). If 'ur' is passed or text
              contains Urdu characters and voice was not explicitly overridden,
              defaults to 'ur-PK-UzmaNeural'.

    Returns:
        The absolute path to the generated temporary MP3 audio file.

    Raises:
        ValueError: If text is empty.
        RuntimeError: If TTS generation fails.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty for TTS generation.")

    clean_text = text.strip()

    # Determine voice based on parameters and text detection
    selected_voice = voice
    if lang in ["ur", "ur-PK"] or (voice == DEFAULT_VOICE_EN and is_urdu_text(clean_text)):
        selected_voice = DEFAULT_VOICE_UR

    # Create a temporary file path
    temp_dir = Path(tempfile.gettempdir())
    output_path = temp_dir / f"voice_{uuid.uuid4().hex}.mp3"

    try:
        communicate = edge_tts.Communicate(text=clean_text, voice=selected_voice)
        await communicate.save(str(output_path))
        logger.info(f"Generated TTS audio using voice '{selected_voice}' at {output_path}")
        return str(output_path)
    except Exception as e:
        logger.error(f"Error during edge-tts synthesis: {e}", exc_info=True)
        # Clean up partial file if created
        if output_path.exists():
            try:
                output_path.unlink()
            except OSError:
                pass
        raise RuntimeError(f"Text-to-speech generation failed: {str(e)}") from e
