"""API schemas for Chat and TTS endpoints."""

from pydantic import BaseModel, Field


class MessageItem(BaseModel):
    """Single message item in conversation history."""

    role: str = Field(..., description="Role of the sender: 'user' or 'assistant'")
    content: str = Field(..., description="Text content of the message")


class ChatRequest(BaseModel):
    """Request schema for voice/text chat."""

    message: str = Field(..., min_length=1, description="User message or speech transcript")
    history: list[MessageItem] = Field(
        default_factory=list,
        description="Optional list of previous messages in conversation for context",
    )


class ChatResponse(BaseModel):
    """Response schema containing the assistant's reply."""

    reply: str = Field(..., description="Assistant's spoken or text response")
    status: str = Field(default="success", description="Execution status")
    music_url: str | None = Field(default=None, description="YouTube URL if play_music tool was called")


class TTSRequest(BaseModel):
    """Request schema for Text-to-Speech synthesis."""

    text: str = Field(..., min_length=1, description="Text to be synthesized into speech")
    voice: str | None = Field(default=None, description="Optional neural voice identifier")
    lang: str | None = Field(default=None, description="Optional language code ('en' or 'ur')")
