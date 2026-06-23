"""Flask API for KarrerLenz ML career analysis."""

from dotenv import load_dotenv

load_dotenv()

import json
import os
import re
import tempfile

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from inference import (
    CAREER_CLASSES,
    MIN_WORD_COUNT,
    combine_inputs,
    check_hf_reachable,
    explain_prediction,
    extract_text_from_certificate,
    extract_text_from_file,
    extract_text_from_github,
    is_model_loaded,
    load_model,
    predict,
    validate_extracted_text,
)

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"


def generate_with_groq(prompt, max_tokens=800):
    if not GROQ_API_KEY:
        return None
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": max_tokens,
            },
            timeout=90,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"].strip()
    except Exception as err:
        print(f"[app] Groq API error: {err}")
        return None


def parse_json_response(text):
    """Strip markdown fences and parse JSON."""
    if not text:
        raise ValueError("Empty response from LLM")
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def generate_narrative(cv_text, predicted_career, confidence_pct):
    excerpt = cv_text[:800] if cv_text else "limited information"
    prompt = (
        "You are KarrerLenz, an AI career advisor for Rwandan tech graduates.\n"
        f"Based on this profile text: {excerpt}\n"
        f"The predicted career path is: {predicted_career} with {confidence_pct}% confidence.\n"
        "Write a personalized 3-sentence career narrative explaining why this career "
        "fits this person and what they should focus on next. Be encouraging and specific."
    )
    narrative = generate_with_groq(prompt, max_tokens=300)
    if not narrative:
        narrative = (
            f"Your background aligns well with a career in {predicted_career}. "
            f"With {confidence_pct}% confidence, your skills and experience point toward this path. "
            "Focus on building relevant projects and connecting with local opportunities in Rwanda."
        )
    return narrative


def generate_chat_response(message, career="", context="", cv_summary="", chat_history=None):
    history_lines = []
    for msg in (chat_history or [])[-10:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        prefix = "User" if role == "user" else "Assistant"
        history_lines.append(f"{prefix}: {content}")

    history_block = "\n".join(history_lines) if history_lines else "No previous messages."

    prompt = (
        "You are KarrerLenz, an AI career advisor for Rwandan tech graduates.\n"
        f"User's predicted career: {career or 'not yet determined'}\n"
        f"User's profile summary: {cv_summary or context or 'General career exploration'}\n\n"
        f"Previous conversation:\n{history_block}\n\n"
        f"Current question: {message}\n\n"
        "Answer specifically for the Rwandan tech market. Be encouraging, "
        "specific, and actionable. Keep responses under 150 words."
    )

    response = generate_with_groq(prompt, max_tokens=300)
    if not response:
        response = (
            "I'm here to help with your career journey in Rwanda's tech sector. "
            "Try asking about skills to learn, local companies, or portfolio building."
        )
    return response


def generate_roadmap(career, cv_text, confidence, key_skills):
    skills_str = ", ".join(key_skills) if key_skills else "general tech skills"
    prompt = (
        "You are KarrerLenz, an AI career advisor for Rwandan tech graduates.\n"
        f"Generate a detailed personalized learning roadmap for someone "
        f"whose career prediction is: {career} with {confidence}% confidence.\n"
        f"Their key skills from their profile: {skills_str}\n\n"
        "Return ONLY valid JSON with NO markdown, NO extra text:\n"
        "{\n"
        f"  'career': '{career}',\n"
        "  'total_duration': '12 months',\n"
        "  'phases': [\n"
        "    {\n"
        "      'phase': 1,\n"
        "      'title': 'Foundation',\n"
        "      'duration': '0-3 months',\n"
        "      'description': '...',\n"
        "      'skills': ['skill1', 'skill2'],\n"
        "      'projects': ['project idea 1', 'project idea 2'],\n"
        "      'resources': [\n"
        "        {'title': 'Resource name', 'url': 'https://...', 'type': 'free'}\n"
        "      ],\n"
        "      'milestone': 'What you can do by end of this phase'\n"
        "    },\n"
        "    { 'phase': 2, 'title': '...', 'duration': '3-6 months', ... },\n"
        "    { 'phase': 3, 'title': '...', 'duration': '6-12 months', ... }\n"
        "  ],\n"
        "  'rwanda_opportunities': ['Company or opportunity specific to Rwanda tech market'],\n"
        "  'certifications': ['cert1', 'cert2'],\n"
        "  'next_action': 'Single most important thing to do this week'\n"
        "}"
    )
    raw = generate_with_groq(prompt, max_tokens=2000)
    if not raw:
        raise ValueError("Roadmap generation failed. Groq API unavailable.")
    return parse_json_response(raw)


@app.route("/health", methods=["GET"])
def health():
    if not is_model_loaded():
        load_model()
    return jsonify({
        "status": "ok",
        "model_loaded": is_model_loaded(),
        "hf_model": "models/karrelenz-distilbert",
        "hf_reachable": check_hf_reachable(),
        "groq_configured": bool(GROQ_API_KEY),
        "career_classes": CAREER_CLASSES,
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    file = request.files.get("file")
    github = (request.form.get("github") or "").strip()
    certificate = request.files.get("certificate")

    if not file and not github and not certificate:
        return jsonify({
            "success": False,
            "error": "Provide at least one input: CV file, GitHub username/URL, or certificate PDF.",
        }), 400

    tmp_paths = []
    input_sources = []
    cv_text = None
    github_text = None
    cert_text = None

    try:
        if file and file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in (".pdf", ".docx"):
                return jsonify({"success": False, "error": "CV must be .pdf or .docx"}), 400
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                file.save(tmp.name)
                tmp_paths.append(tmp.name)
            cv_text = extract_text_from_file(tmp_paths[-1], strict=True)
            input_sources.append("cv")

        if github:
            github_text = extract_text_from_github(github)
            input_sources.append("github")

        if certificate and certificate.filename:
            ext = os.path.splitext(certificate.filename)[1].lower()
            if ext != ".pdf":
                return jsonify({"success": False, "error": "Certificate must be a PDF"}), 400
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                certificate.save(tmp.name)
                tmp_paths.append(tmp.name)
            cert_text = extract_text_from_certificate(tmp_paths[-1])
            input_sources.append("certificate")

        combined_text = combine_inputs(cv_text, github_text, cert_text)
        min_words = 20 if input_sources == ["github"] else MIN_WORD_COUNT
        validate_extracted_text(combined_text, min_words=min_words)

        result = predict(combined_text)
        try:
            explanation = explain_prediction(combined_text, num_features=6)
            result["explanation"] = explanation
        except Exception as e:
            print(f"[app] Explanation failed (non-critical): {e}")
            result["explanation"] = None

        narrative = generate_narrative(
            combined_text, result["predicted_career"], result["confidence_pct"]
        )

        return jsonify({
            "success": True,
            "predicted_career": result["predicted_career"],
            "confidence_scores": result["confidence_scores"],
            "confidence_pct": result["confidence_pct"],
            "narrative": narrative,
            "key_skills": result.get("key_skills", []),
            "input_sources": input_sources,
            "explanation": result["explanation"],
        })

    except ValueError as err:
        return jsonify({"success": False, "error": str(err)}), 400
    except requests.RequestException as err:
        print(f"[app] Analyze network error: {err}")
        return jsonify({"success": False, "error": f"External service error: {err}"}), 502
    except Exception as err:
        print(f"[app] Analyze error: {err}")
        return jsonify({"success": False, "error": str(err) or "Analysis failed. Please try again."}), 500
    finally:
        for path in tmp_paths:
            if path and os.path.exists(path):
                os.unlink(path)


@app.route("/explain", methods=["POST"])
def explain():
    """
    Explain why the model predicted a specific career.
    Accepts same input as /analyze (file, github, certificate)
    Returns LIME explanation with supporting and contradicting words.
    """
    if "file" not in request.files and \
       not request.form.get("github") and \
       "certificate" not in request.files:
        return jsonify({
            "success": False,
            "error": "No input provided",
        }), 400

    tmp_path = None
    try:
        # Extract text (reuse same logic as /analyze)
        texts = []

        # CV file
        if "file" in request.files:
            file = request.files["file"]
            if file.filename:
                ext = os.path.splitext(file.filename)[1].lower()
                with tempfile.NamedTemporaryFile(
                    delete=False, suffix=ext
                ) as tmp:
                    file.save(tmp.name)
                    tmp_path = tmp.name
                cv_text = extract_text_from_file(tmp_path)
                if cv_text:
                    texts.append(cv_text)

        # GitHub
        github_input = request.form.get("github", "").strip()
        if github_input:
            github_text = extract_text_from_github(github_input)
            if github_text:
                texts.append(github_text)

        # Combine all texts
        combined = combine_inputs(
            cv_text=texts[0] if len(texts) > 0 else None,
            github_text=texts[1] if len(texts) > 1 else None,
        )

        if not combined or len(combined.split()) < 10:
            raise ValueError("Not enough text to explain")

        # Generate LIME explanation
        print("[app] Generating LIME explanation...")
        explanation = explain_prediction(combined, num_features=8)

        return jsonify({
            "success": True,
            "data": explanation,
        })

    except Exception as e:
        print(f"[app] Explain error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route("/roadmap", methods=["POST"])
def roadmap():
    data = request.get_json() or {}
    career = (data.get("career") or "").strip()
    cv_text = data.get("cv_text") or data.get("cvText") or ""
    confidence = data.get("confidence") or 0
    key_skills = data.get("key_skills") or data.get("keySkills") or []

    if not career:
        return jsonify({"success": False, "error": "Career is required"}), 400

    try:
        roadmap_data = generate_roadmap(career, cv_text, confidence, key_skills)
        return jsonify({"success": True, "data": roadmap_data})
    except ValueError as err:
        return jsonify({"success": False, "error": str(err)}), 400
    except Exception as err:
        print(f"[app] Roadmap error: {err}")
        return jsonify({"success": False, "error": "Roadmap generation failed."}), 500


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = (data.get("message") or "").strip()
    career = data.get("career", "")
    context = data.get("context", "")
    cv_summary = data.get("cv_summary") or data.get("cvSummary") or ""
    chat_history = data.get("chat_history") or data.get("chatHistory") or []

    if not message:
        return jsonify({"success": False, "error": "Message is required"}), 400

    try:
        response = generate_chat_response(
            message, career, context, cv_summary, chat_history
        )
        return jsonify({"success": True, "response": response})
    except Exception as err:
        print(f"[app] Chat error: {err}")
        return jsonify({"success": False, "error": "Chat failed. Please try again."}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[app] Starting ML service on port {port}")
    load_model()
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "0") == "1")
