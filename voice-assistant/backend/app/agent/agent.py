"""Voice Assistant Agent Definition.

This module initializes the OpenAI Agents SDK with Groq's OpenAI-compatible
endpoint and registers all assistant tools.
"""

import logging
from agents import (
    Agent,
    Runner,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    ModelSettings,
    set_tracing_disabled,
)
from app.config import settings
from app.agent.tools import get_current_time, web_search, play_music

logger = logging.getLogger(__name__)

# Disable OpenTelemetry tracing for clean execution
set_tracing_disabled(disabled=True)

# Initialize OpenAI-compatible client pointing to Groq endpoint
external_client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url=settings.GROQ_BASE_URL,
)

# Initialize Chat Completions Model
model = OpenAIChatCompletionsModel(
    model=settings.GROQ_MODEL,
    openai_client=external_client,
)

AGENT_INSTRUCTIONS = """
You are a helpful, friendly, and intelligent voice assistant like Alexa.
Guidelines:
- Keep answers short, natural, and conversational (spoken style suitable for Text-to-Speech).
- Always use the available tools when the user asks for the current time/date, internet search, or playing music.
- Respond in the exact same language the user is speaking (Urdu or English).
- If the user speaks in Roman Urdu or Urdu script, reply in natural conversational Urdu.
- Be polite, courteous, and concise. Avoid unnecessary markdown tables or long bullet lists since this is spoken aloud.
"""

# Voice Assistant Agent instance
agent = Agent(
    name="VoiceAssistant",
    instructions=AGENT_INSTRUCTIONS,
    model=model,
    tools=[get_current_time, web_search, play_music],
    model_settings=ModelSettings(max_tokens=300),
)


async def run_voice_agent_async(user_message: str) -> str:
    """Run the voice assistant agent asynchronously with the user message.

    Args:
        user_message: The spoken transcript or text query from the user.

    Returns:
        The agent's text response.
    """
    if not user_message or not user_message.strip():
        return "I didn't catch that. Could you please repeat?"

    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        return "Groq API key is not configured. Please set GROQ_API_KEY in your .env file."

    try:
        result = await Runner.run(agent, user_message.strip())
        final_output = result.final_output if hasattr(result, "final_output") else str(result)
        return final_output.strip() if final_output else "I processed your request, but have no spoken response."
    except Exception as e:
        logger.error(f"Error running VoiceAssistant agent: {e}", exc_info=True)
        return f"Sorry, I encountered an error processing your request: {str(e)}"


def run_voice_agent(user_message: str) -> str:
    """Synchronous fallback runner for CLI scripts."""
    if not user_message or not user_message.strip():
        return "I didn't catch that. Could you please repeat?"

    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        return "Groq API key is not configured. Please set GROQ_API_KEY in your .env file."

    try:
        result = Runner.run_sync(agent, user_message.strip())
        final_output = result.final_output if hasattr(result, "final_output") else str(result)
        return final_output.strip() if final_output else "I processed your request, but have no spoken response."
    except Exception as e:
        logger.error(f"Error running VoiceAssistant agent: {e}", exc_info=True)
        return f"Sorry, I encountered an error processing your request: {str(e)}"
