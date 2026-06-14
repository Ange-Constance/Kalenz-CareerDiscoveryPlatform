"""Flask API for KarrerLenz ML career analysis."""

import os
import tempfile

import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from inference import (
    load_model,
    predict,
    extract_text_from_file,
    is_model_loaded,
)

load_dotenv()

app = Flask(__name__)
CORS(app)

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "mistral")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


def generate_with_ollama(prompt):
    """Try Ollama first for text generation."""
    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=60,
        )
        response.raise_for_status()
        return response.json().get("response", "").strip()
    except Exception as err:
        print(f"[app] Ollama unavailable: {err}")
        return None


def generate_with_groq(prompt):
    """Fallback to Groq API when Ollama is unavailable."""
    if not GROQ_API_KEY:
        print("[app] GROQ_API_KEY not set — skipping Groq fallback")
        return None

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mixtral-8x7b-32768",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 300,
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as err:
        print(f"[app] Groq API error: {err}")
        return None


def generate_narrative(cv_text, predicted_career, confidence_pct):
    """Generate a personalized career narrative using Ollama or Groq."""
    excerpt = cv_text[:800] if cv_text else "limited information"

    prompt = (
        "You are KarrerLenz, an AI career advisor for Rwandan tech graduates.\n"
        f"Based on this CV text: {excerpt}\n"
        f"The predicted career path is: {predicted_career} with {confidence_pct}% confidence.\n"
        "Write a personalized 3-sentence career narrative explaining why this career "
        "fits this person and what they should focus on next. Be encouraging and specific."
    )

    narrative = generate_with_ollama(prompt) or generate_with_groq(prompt)

    if not narrative:
        narrative = (
            f"Your background aligns well with a career in {predicted_career}. "
            f"With {confidence_pct}% confidence, your skills and experience point toward this path. "
            "Focus on building relevant projects and connecting with local opportunities in Rwanda."
        )

    return narrative


def generate_chat_response(message, career="", context=""):
    """Generate a chat response for career Q&A."""
    prompt = (
        "You are KarrerLenz, an AI career advisor for Rwandan tech graduates.\n"
        f"The user's predicted career is: {career or 'not yet determined'}.\n"
        f"Context: {context or 'general career guidance'}.\n\n"
        f"User: {message}\n\nAssistant:"
    )

    response = generate_with_ollama(prompt) or generate_with_groq(prompt)

    if not response:
        response = (
            "I'm here to help with your career journey in Rwanda's tech sector. "
            "Try asking about skills to learn, local companies, or portfolio building."
        )

    return response


@app.route("/health", methods=["GET"])
def health():
    try:
        load_model()
        loaded = is_model_loaded()
    except Exception:
        loaded = False

    return jsonify({"status": "ok", "model_loaded": loaded})


@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded. Send CV as multipart field 'file'."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"success": False, "error": "Empty filename"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".pdf", ".docx"):
        return jsonify({"success": False, "error": "Only .pdf and .docx files are supported"}), 400

    tmp_path = None
    try:
        load_model()

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        print(f"[app] Analyzing file: {file.filename}")

        # Extract text from uploaded file
        raw_text = extract_text_from_file(tmp_path)

        if not raw_text or len(raw_text.strip()) < 50:
            raise ValueError("No readable text found in the uploaded file")

        # Run ML prediction — returns a dict
        result = predict(raw_text)
        predicted_career = result["predicted_career"]
        confidence_scores = result["confidence_scores"]
        confidence_pct = result["confidence_pct"]

        # Generate narrative (Ollama → Groq → fallback)
        narrative = generate_narrative(raw_text, predicted_career, confidence_pct)

        print(f"[app] Prediction: {predicted_career} ({confidence_pct}%)")

        return jsonify({
            "success": True,
            "predicted_career": predicted_career,
            "confidence_scores": confidence_scores,
            "confidence_pct": confidence_pct,
            "narrative": narrative,
        })

    except ValueError as err:
        return jsonify({"success": False, "error": str(err)}), 400
    except FileNotFoundError as err:
        return jsonify({"success": False, "error": str(err)}), 503
    except Exception as err:
        print(f"[app] Analyze error: {err}")
        return jsonify({"success": False, "error": "Analysis failed. Please try again."}), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    career = data.get("career", "")
    context = data.get("context", "")

    if not message:
        return jsonify({"success": False, "error": "Message is required"}), 400

    try:
        response = generate_chat_response(message, career, context)
        return jsonify({"success": True, "response": response})
    except Exception as err:
        print(f"[app] Chat error: {err}")
        return jsonify({"success": False, "error": "Chat failed. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[app] Starting ML service on port {port}")
    load_model()
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "0") == "1")