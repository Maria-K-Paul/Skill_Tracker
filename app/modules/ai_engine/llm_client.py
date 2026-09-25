"""
app/modules/ai_engine/llm_client.py
--------------------------------------
Pluggable LLM client adapter.

Wraps the external LLM provider (e.g. OpenAI) behind a stable interface.
Swap providers by changing LLM_PROVIDER in config without touching generator logic.

TODO: implement LLMClient.generate(prompt: str) → str
TODO: implement retry logic with exponential backoff.
TODO: implement token counting to respect context window limits.
TODO: add provider adapters: OpenAIAdapter, AnthropicAdapter, etc.
TODO: add response caching for identical topic+difficulty prompts (optional).
"""

from app.core.config import settings


class LLMClient:
    """
    Abstract LLM client. Initialised with settings.llm_provider.
    Use generate() to get a completion string from the configured provider.
    """

    def __init__(self) -> None:
        self.provider = settings.llm_provider
        self.model = settings.llm_model
        self.api_key = settings.llm_api_key
        # TODO: initialise provider-specific SDK client

    async def generate(self, prompt: str) -> str:
        """
        Send a prompt to the LLM and return the raw text response.

        TODO: dispatch to the appropriate adapter based on self.provider.
        TODO: implement retry with exponential backoff on rate limit errors.
        """
        # TODO: implement
        return ""


# Module-level singleton — import this instead of instantiating directly.
llm_client = LLMClient()
