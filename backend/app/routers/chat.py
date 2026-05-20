"""AI Chat router — handles chat messages and conversation history."""

from fastapi import APIRouter, Depends
from app.dependencies import get_ai_agent, get_memory_service
from app.services.ai_agent import AIAgent
from app.services.memory_service import MemoryService
from app.models.chat import ChatRequest, ChatResponse, ConversationHistory, SessionInfo
from app.models.common import APIResponse
from typing import List

router = APIRouter()


@router.post("", response_model=APIResponse[ChatResponse])
async def send_message(
    request: ChatRequest,
    agent: AIAgent = Depends(get_ai_agent),
):
    """Send a message to the AI agent and get a response."""
    ai_message = await agent.chat(request.session_id, request.message)

    response = ChatResponse(
        session_id=request.session_id,
        message=ai_message,
        tool_calls=ai_message.metadata.get("tool_calls") if ai_message.metadata else None,
    )

    return APIResponse(data=response, message="Message processed")


@router.get("/history/{session_id}", response_model=APIResponse[ConversationHistory])
async def get_history(
    session_id: str,
    memory: MemoryService = Depends(get_memory_service),
):
    """Get conversation history for a session."""
    conversation = memory.get_conversation(session_id)
    if not conversation:
        return APIResponse(success=False, error="Session not found", message="No conversation found for this session")

    return APIResponse(data=conversation)


@router.delete("/history/{session_id}", response_model=APIResponse)
async def clear_history(
    session_id: str,
    memory: MemoryService = Depends(get_memory_service),
):
    """Clear conversation history for a session."""
    success = memory.clear_session(session_id)
    if not success:
        return APIResponse(success=False, error="Session not found")
    return APIResponse(message="Session cleared")


@router.get("/sessions", response_model=APIResponse[List[SessionInfo]])
async def list_sessions(
    memory: MemoryService = Depends(get_memory_service),
):
    """List all active chat sessions."""
    sessions = memory.list_sessions()
    return APIResponse(data=sessions, message=f"{len(sessions)} active sessions")
