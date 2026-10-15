"""Voice Assistant Agent Tools.

This module provides tools for the voice assistant:
- get_current_time: Returns the current date and time.
- web_search: Queries DuckDuckGo for real-time web results.
- play_music: Generates a YouTube search link to play music.
"""

from datetime import datetime
import urllib.parse
from agents import function_tool
from duckduckgo_search import DDGS


@function_tool
def get_current_time() -> str:
    """Returns the current local date and time in a human-readable format.

    Use this tool whenever the user asks about the current time, date, day, or year.
    """
    try:
        now = datetime.now()
        return now.strftime("%I:%M %p on %A, %d %B %Y")
    except Exception as e:
        return f"Unable to fetch current time: {str(e)}"


@function_tool
def web_search(query: str) -> str:
    """Search the internet for real-time information using DuckDuckGo.

    Args:
        query: The search term or question to search the web for.

    Returns:
        A formatted string with search result titles and snippets, or an error message.
    """
    if not query or not query.strip():
        return "Search query cannot be empty."

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query.strip(), max_results=4))

        if not results:
            return f"No search results found for '{query}'."

        formatted_results = []
        for idx, result in enumerate(results, start=1):
            title = result.get("title", "No Title")
            snippet = result.get("body", "No description available.")
            # Limit snippet to ~180 characters for concise spoken responses
            trimmed_snippet = snippet[:180].strip()
            if len(snippet) > 180:
                trimmed_snippet += "..."
            formatted_results.append(f"{idx}. {title}: {trimmed_snippet}")

        return "\n".join(formatted_results)
    except Exception as e:
        return f"Web search failed due to an error: {str(e)}"


@function_tool
def play_music(song_name: str) -> str:
    """Find and play a song, music, or video by generating a YouTube link.

    Args:
        song_name: The name of the song, artist, or music track to search for.

    Returns:
        A confirmation message containing the YouTube search URL.
    """
    if not song_name or not song_name.strip():
        return "Please provide a valid song name."

    try:
        encoded_query = urllib.parse.quote_plus(song_name.strip())
        youtube_url = f"https://www.youtube.com/results?search_query={encoded_query}"
        return f"Playing '{song_name.strip()}'. Open this link: {youtube_url}"
    except Exception as e:
        return f"Failed to generate music link: {str(e)}"
