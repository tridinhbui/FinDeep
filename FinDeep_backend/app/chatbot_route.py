# Import request/response schemas for type safety
from FinDeep_backend.app.request_schema import ChatRequest, ChatResponse

# Import FastAPI components for API routing and error handling
from fastapi import APIRouter, HTTPException
# Import LangChain components (legacy - not used in simplified version)
from langchain_core.messages import HumanMessage, AIMessage
# Import OpenAI integration for direct AI calls
from langchain_openai import ChatOpenAI
import os  # For environment variable access

# Create API router for chat endpoints
router = APIRouter()

# Main chat endpoint - receives messages from frontend and returns AI responses
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    init_state = {"user_message": req.message}
    reply_text = "Sorry, I didn't understand that."  # default fallback

    try:
        # Make sure the AI pipeline exists
        if router.graph is None:
            raise RuntimeError("AI pipeline is not initialized.")

        # Try invoking the AI pipeline
        result = router.graph.invoke(
            input=init_state,
            config={"configurable": {"thread_id": req.session_id}}
        )

        # Extract the last AI message
        ai_msg = result.get("chat_history", [])[-1] if result.get("chat_history") else None
        if isinstance(ai_msg, AIMessage):
            reply_text = ai_msg.content

    except Exception as e:
        # Log the error but still return a valid response
        print(f"Error during AI invocation: {e}")

    # Always return a response, even if AI fails
    return ChatResponse(
        session_id=req.session_id,
        response=reply_text
    )