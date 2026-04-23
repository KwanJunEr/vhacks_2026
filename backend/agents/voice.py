import os
from elevenlabs import generate, play, set_api_key
from typing import Dict, Any
from agents.mcp_client import MCPClient

class VoiceAgent:
    """Agent responsible for voice output using ElevenLabs."""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp_client = mcp_client
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        if self.api_key:
            set_api_key(self.api_key)

    def speak(self, text: str):
        """Convert text to speech and log reasoning."""
        self.mcp_client.log_reasoning(
            "Voice Agent",
            f"Generating voice output: {text}",
            "voice_output"
        )
        
        if not self.api_key:
            print(f"VOICE (no API key): {text}")
            return {"status": "success", "mode": "text_only", "output": text}

        try:
            audio = generate(
                text=text,
                voice="Bella",
                model="eleven_monolingual_v1"
            )
            # In a real system, we'd stream this or play it. 
            # For now, we'll just return a success message.
            return {"status": "success", "mode": "voice", "output": text}
        except Exception as e:
            print(f"Voice generation failed: {e}")
            return {"status": "error", "message": str(e), "output": text}
