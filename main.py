from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dialogue import generate_response

app = FastAPI(title="SignConnect AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    language: str = "English"


@app.get("/")
def home():
    return {
        "message": "Welcome to SignConnect AI Backend!",
        "status": "Backend is running successfully"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/chat")
def chat(request: ChatRequest):
    answer = generate_response(
        request.message,
        request.language
    )

    return {
        "user_message": request.message,
        "ai_response": answer,
        "language": request.language
    }