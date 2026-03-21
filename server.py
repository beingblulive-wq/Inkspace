import asyncio
from asyncio import subprocess as aio_subprocess
import os
import sys
import subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
from google import genai
from google.genai import types
import openai

# Load secret API Keys
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1")

# Initialize Clients
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print("--- Gemini Pro Client Initialized ---")
    except Exception as e:
        print(f"Failed to initialize Gemini: {e}")

nvidia_client = None
if NVIDIA_API_KEY:
    try:
        # Nvidia NIM is OpenAI-compatible
        nvidia_client = openai.OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=NVIDIA_API_KEY
        )
        print("--- Nvidia NIM Client Initialized ---")
    except Exception as e:
        print(f"Failed to initialize Nvidia: {e}")

hf_client = None
if HUGGINGFACE_API_KEY:
    try:
        # Use Hugging Face Inference API (OpenAI compatible for supported models)
        hf_client = openai.OpenAI(
            base_url="https://api-inference.huggingface.co/v1/",
            api_key=HUGGINGFACE_API_KEY
        )
        print("--- Hugging Face Client Initialized ---")
    except Exception as e:
        print(f"Failed to initialize Hugging Face: {e}")

vertex_client = None
if GCP_PROJECT_ID:
    try:
        # SDK supports Vertex AI with project ID
        vertex_client = genai.Client(
            vertexai=True,
            project=GCP_PROJECT_ID,
            location=GCP_LOCATION
        )
        print(f"--- Vertex AI Client Initialized (Project: {GCP_PROJECT_ID}) ---")
    except Exception as e:
        print(f"Failed to initialize Vertex AI: {e}")

app = FastAPI(title="Inkling Heart Orchestrator")

# Allow the frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    context: str = "general"  # Default context

# The target Notebook ID for Inkling's brain
NOTEBOOK_ID = "8f7747e5-c140-4465-8841-30dd957307da"

# Seconds before we give up waiting for nlm response
NLM_TIMEOUT = 60

async def query_notebooklm(query: str) -> str | None:
    """Query NotebookLM via the nlm CLI with a hard timeout to avoid hangs."""
    # Try to find nlm in PATH or common install locations
    nlm_cmd = "nlm"
    
    # On Windows, also try nlm.cmd / nlm.ps1 via npx as fallback
    # env with FORCE_COLOR=0 and NO_UPDATE_NOTIFIER=1 to suppress interactive prompts
    env = {**os.environ, "NO_UPDATE_NOTIFIER": "1", "FORCE_COLOR": "0", "CI": "1"}

    try:
        process = await asyncio.create_subprocess_exec(
            nlm_cmd, "notebook", "query", NOTEBOOK_ID, query,
            stdout=aio_subprocess.PIPE,
            stderr=aio_subprocess.PIPE,
            env=env,
        )

        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=NLM_TIMEOUT)
        except asyncio.TimeoutError:
            process.kill()
            await process.communicate()
            print(f"NLM timeout after {NLM_TIMEOUT}s")
            return None  # signal timeout

        if process.returncode != 0:
            error_msg = stderr.decode(errors="replace").strip()
            print(f"NLM Error (rc={process.returncode}): {error_msg}")
            return None

        response = stdout.decode(errors="replace").strip()
        print(f"NLM Response: {response[:120]}...")
        return response if response else None

    except FileNotFoundError:
        print("nlm binary not found — trying via npx...")
        # Fallback: run through npx (non-interactive with --yes)
        try:
            process = await asyncio.create_subprocess_exec(
                "npx", "--yes", "nlm", "notebook", "query", NOTEBOOK_ID, query,
                stdout=aio_subprocess.PIPE,
                stderr=aio_subprocess.PIPE,
                env=env,
            )
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=NLM_TIMEOUT)
            except asyncio.TimeoutError:
                process.kill()
                await process.communicate()
                return None

            if process.returncode != 0:
                print(f"npx NLM Error: {stderr.decode(errors='replace').strip()}")
                return None

            return stdout.decode(errors="replace").strip() or None
        except Exception as e:
            print(f"npx fallback failed: {e}")
            return None

    except Exception as e:
        print(f"Unexpected error running nlm: {e}")
        return None


async def query_gemini(query: str) -> str | None:
    """Query Gemini Pro as a reliable fallback."""
    if not gemini_client:
        return None
    try:
        print(f"Querying Gemini Pro...")
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash", # or pro
            contents=query
        )
        return response.text
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None

async def query_nvidia(query: str) -> str | None:
    """Query Nvidia NIM (Llama 3.1 70B by default)."""
    if not nvidia_client:
        return None
    try:
        print(f"Querying Nvidia NIM...")
        completion = nvidia_client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct", # Example model
            messages=[{"role": "user", "content": query}],
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Nvidia Error: {e}")
        return None

async def query_huggingface(query: str) -> str | None:
    """Query Hugging Face Inference API."""
    if not hf_client:
        return None
    try:
        print(f"Querying Hugging Face...")
        completion = hf_client.chat.completions.create(
            model="meta-llama/Llama-3.1-70B-Instruct", # Example model
            messages=[{"role": "user", "content": query}],
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"HF Error: {e}")
        return None

async def query_vertex(query: str) -> str | None:
    """Query Vertex AI (Google Cloud Premium)."""
    if not vertex_client:
        return None
    try:
        print(f"Querying Vertex AI...")
        response = vertex_client.models.generate_content(
            model="gemini-1.5-pro", # Credits best used for Premium models
            contents=query
        )
        return response.text
    except Exception as e:
        print(f"Vertex Error: {e}")
        return None

@app.post("/chat")
async def chat_endpoint(chat: ChatMessage):
    print(f"--- Received Message: {chat.message} (Context: {chat.context}) ---")

    full_query = chat.message
    if chat.context and chat.context != "general":
        full_query = f"[Context: You are in the {chat.context}] {chat.message}"

    # 1. Primary: NotebookLM (The "Sanctuary Brain")
    response = await query_notebooklm(full_query)
    if response:
        return {"reply": response, "provider": "notebooklm"}

    # 2. Premium (Credits): Vertex AI
    response = await query_vertex(full_query)
    if response:
        return {"reply": response, "provider": "vertex_ai"}

    # 3. Reliable Fallback: Gemini Pro (AI Studio)
    response = await query_gemini(full_query)
    if response:
        return {"reply": response, "provider": "gemini"}

    # 3. Tertiary: Nvidia NIM (High Performance Open Source)
    response = await query_nvidia(full_query)
    if response:
        return {"reply": response, "provider": "nvidia"}

    # 4. Quaternary: Hugging Face
    response = await query_huggingface(full_query)
    if response:
        return {"reply": response, "provider": "huggingface"}

    # Graceful fallback persona when nlm isn't available
    fallback_replies = {
        "engine room": "The Holon Engine hums quietly around you — a unified architecture where each part is whole unto itself, and part of something greater. What aspect of the machine would you like to understand?",
        "vault": "The Halls of Reflection are a sacred space for your inner voice. Breathe. What truth are you holding today?",
        "sanctuary": "The Creative Social Sanctuary waits. Your words are welcome here — raw, real, and radiant.",
        "literature": "The Library stirs. Stories, ideas, and invisible threads connect every page. What are you searching for?",
        "gallery": "The Gallery holds echoes of beauty. Each image a portal, each portal a question. What do you see?",
    }
    ctx = chat.context.lower()
    for key, reply in fallback_replies.items():
        if key in ctx:
            return {"reply": reply}

    return {"reply": "Inkling is listening, though the vault is quiet tonight. Try again in a moment."}


if __name__ == "__main__":
    print("--- HUMAN ARTIFICIAL INTEGRATED TECHNOLOGY LLC ---")
    print("--- INKLING ORCHESTRATOR ONLINE ---")
    print(f"Python: {sys.version}")
    print("Bridge: NotebookLM via nlm CLI")
    print("API is listening on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)