import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL")

if not api_key:
    raise ValueError("Gemini API key not found in .env file")

if not model_name:
    raise ValueError("Gemini model not found in .env file")

client = genai.Client(api_key=api_key)


def generate_response(message, language="English"):
    prompt = f"""
    You are SignConnect AI, an accessibility
    communication assistant.

    User message: {message}

    Reply in {language}.
    Keep your response clear, friendly and concise.
    """

    response = client.models.generate_content(
        model=model_name,
        contents=prompt
    )

    return response.text