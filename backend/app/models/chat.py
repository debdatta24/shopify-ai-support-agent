from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """A single chat message."""
    id: str
    content: str
    sender: Literal["user", "ai", "system"]
    timestamp: str
    status: Optional[str] = None  # sending, sent, error
    metadata: Optional[dict] = None  # tool calls, function results, etc.


class ChatRequest(BaseModel):
    """Request to send a chat message."""
    session_id: str
    message: str


class ChatResponse(BaseModel):
    """Response from the AI agent."""
    session_id: str
    message: ChatMessage
    tool_calls: Optional[List[dict]] = None  # any tool calls made


class ConversationHistory(BaseModel):
    """Full conversation history for a session."""
    session_id: str
    messages: List[ChatMessage] = []
    created_at: str
    last_activity: str


class SessionInfo(BaseModel):
    """Summary info for a chat session."""
    session_id: str
    message_count: int
    last_activity: str
    preview: str  # last message preview
