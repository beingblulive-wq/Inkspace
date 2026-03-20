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

# Load secret API Key
load_dotenv()

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


@app.post("/chat")
async def chat_endpoint(chat: ChatMessage):
    print(f"--- Received Message: {chat.message} (Context: {chat.context}) ---")

    full_query = chat.message
    if chat.context and chat.context != "general":
        full_query = f"[Context: You are in the {chat.context}] {chat.message}"

    response = await query_notebooklm(full_query)

    if response:
        return {"reply": response}

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