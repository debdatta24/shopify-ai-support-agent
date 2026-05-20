"""In-memory chat history store with per-session sliding window."""

from typing import Dict, List, Optional
from datetime import datetime, timezone

from app.config import settings
from app.models.chat import ChatMessage, ConversationHistory, SessionInfo
from app.utils.helpers import generate_id


class MemoryService:
    """Manages per-session conversation history in memory."""

    def __init__(self):
        self._sessions: Dict[str, List[ChatMessage]] = {}
        self._session_created: Dict[str, str] = {}
        self._max_history = settings.max_conversation_history

    def get_or_create_session(self, session_id: str) -> str:
        """Get an existing session or create a new one."""
        if session_id not in self._sessions:
            self._sessions[session_id] = []
            self._session_created[session_id] = datetime.now(timezone.utc).isoformat()
        return session_id

    def add_message(self, session_id: str, message: ChatMessage) -> None:
        """Add a message to a session's history (sliding window)."""
        self.get_or_create_session(session_id)
        self._sessions[session_id].append(message)

        # Enforce sliding window — keep only the last N messages
        if len(self._sessions[session_id]) > self._max_history:
            self._sessions[session_id] = self._sessions[session_id][-self._max_history:]

    def get_history(self, session_id: str) -> List[ChatMessage]:
        """Get all messages for a session."""
        return self._sessions.get(session_id, [])

    def get_conversation(self, session_id: str) -> Optional[ConversationHistory]:
        """Get full conversation details for a session."""
        if session_id not in self._sessions:
            return None

        messages = self._sessions[session_id]
        last_activity = messages[-1].timestamp if messages else self._session_created.get(session_id, "")

        return ConversationHistory(
            session_id=session_id,
            messages=messages,
            created_at=self._session_created.get(session_id, ""),
            last_activity=last_activity,
        )

    def clear_session(self, session_id: str) -> bool:
        """Clear a session's history."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            if session_id in self._session_created:
                del self._session_created[session_id]
            return True
        return False

    def list_sessions(self) -> List[SessionInfo]:
        """List all active sessions with summary info."""
        sessions = []
        for sid, messages in self._sessions.items():
            if messages:
                last_msg = messages[-1]
                sessions.append(
                    SessionInfo(
                        session_id=sid,
                        message_count=len(messages),
                        last_activity=last_msg.timestamp,
                        preview=last_msg.content[:80] + ("..." if len(last_msg.content) > 80 else ""),
                    )
                )
        return sessions

    def get_messages_for_openai(self, session_id: str) -> List[dict]:
        """Convert session history to OpenAI message format."""
        messages = self.get_history(session_id)
        openai_messages = []
        for msg in messages:
            role = "user" if msg.sender == "user" else "assistant"
            openai_messages.append({"role": role, "content": msg.content})
        return openai_messages
