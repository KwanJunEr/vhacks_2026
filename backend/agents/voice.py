import os
import openai
from typing import Dict, Any
from agents.mcp_client import MCPClient

class VoiceAgent:
    """Agent responsible for voice output using OpenAI TTS."""

    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client
        api_key = os.getenv("OPEN_API_KEY")
        self.client = openai.OpenAI(api_key=api_key) if api_key else None

    def speak(self, text: str) -> Dict[str, Any]:
        """Convert text to speech using OpenAI TTS."""
        self.mcp_client.log_reasoning(
            "Voice Agent",
            f"Generating voice output: {text}",
            "voice_output"
        )

        if not self.client:
            print(f"VOICE (no API key): {text}")
            return {"status": "success", "mode": "text_only", "output": text}

        try:
            self.client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=text,
            )
            return {"status": "success", "mode": "voice", "output": text}
        except Exception as e:
            print(f"Voice generation failed: {e}")
            return {"status": "error", "message": str(e), "output": text}
