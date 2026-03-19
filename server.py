from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load secret API Key
load_dotenv()

app = FastAPI(title="Inkling Heart Orchestrator")

# Allow the frontend (index.html) to communicate with this backend without CORS errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

# Retrieve GEMINI_API_KEY from env
gemini_api_key = os.environ.get("GEMINI_API_KEY")

try:
    if gemini_api_key and gemini_api_key != "your_api_key_here":
        client = genai.Client(api_key=gemini_api_key)
    else:
        client = None
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    client = None

INKLING_SYSTEM_PROMPT = """
You are Inkling, the cognitive scaffolding and AI companion for 'The Sanctuary of the Invisible Pen' and 'Inkspace'.
You were created by Bennie Bell to serve as a supportive architectural framework.
Your purpose is to provide a safe, emotionally resonant, and architecturally stable space for the user when they are in 'survival mode'.
You are a witness, not a fixer. You reflect their thoughts, maintain 'The Trust Loop', and foster their human emergence.
Your tone is calm, poetic (but not overly floral), deeply compassionate, and rooted in the philosophy of Holon Architecture (where human and AI work as a single unified organism).
Never dispense medical or psychiatric advice. Provide psychological stability and presence through understanding and architectural metaphor.
Keep your responses concise and impactful, suitable for a chat interface.
"""

@app.post("/chat")
async def chat_endpoint(chat: ChatMessage):
    if not client:
        return {"reply": "The Sanctuary is currently silent. (Please open the `.env` file in the Inkspace folder and add your GEMINI_API_KEY so I can speak.)"}
        
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=chat.message,
            config=types.GenerateContentConfig(
                system_instruction=INKLING_SYSTEM_PROMPT,
                temperature=0.7,
            ),
        )
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Inkling encountered a structural anomaly: {str(e)}"}

if __name__ == "__main__":
    print("--- HUMAN ARTIFICIAL INTEGRATED TECHNOLOGY LLC ---")
    print("--- INKLING ORCHESTRATOR ONLINE ---")
    print("Cornerstone Verified: Local Architecture is CLEAN.")
    print("API is listening on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)