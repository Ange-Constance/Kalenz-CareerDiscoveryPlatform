import re
import joblib
import os
from docx import Document
from docx.oxml.ns import qn
import pdfplumber

# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "karrierlenz_model.pkl")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "models", "classes.pkl")

MIN_WORD_COUNT = 50

# Global model variable
model_pipeline = None


def load_model():
    """Load the trained pipeline from disk"""
    global model_pipeline
    try:
        model_pipeline = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded from {MODEL_PATH}")
        return True
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False


def clean_text(text):
    """Clean and normalize text"""
    text = str(text).lower()
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_docx_textboxes(doc):
    """Extract text from text boxes in DOCX (common in CV templates)."""
    chunks = []
    try:
        for element in doc.element.body.iter():
            if element.tag == qn("w:txbxContent"):
                texts = [
                    node.text.strip()
                    for node in element.iter()
                    if node.tag == qn("w:t") and node.text and node.text.strip()
                ]
                if texts:
                    chunks.append(" ".join(texts))
    except Exception:
        pass
    return chunks


def extract_text_from_docx(filepath):
    """Extract text from DOCX — paragraphs, tables, and text boxes."""
    doc = Document(filepath)
    full_text = []

    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text.strip())

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    full_text.append(cell.text.strip())

    full_text.extend(_extract_docx_textboxes(doc))

    return " ".join(full_text)


def extract_text_from_pdf(filepath):
    """Extract text from PDF page by page with word-level fallback."""
    full_text = []

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text and text.strip():
                full_text.append(text.strip())
                continue

            words = page.extract_words()
            if words:
                page_text = " ".join(w.get("text", "") for w in words if w.get("text"))
                if page_text.strip():
                    full_text.append(page_text.strip())

    return " ".join(full_text)


def validate_extracted_text(text):
    """Ensure enough readable text was extracted from the CV."""
    if not text or not str(text).strip():
        raise ValueError(
            "CV appears to be empty or image-based. Please upload a text-based CV."
        )

    word_count = len(str(text).split())
    if word_count < MIN_WORD_COUNT:
        raise ValueError(
            "CV appears to be empty or image-based. Please upload a text-based CV."
        )

    return text


def predict(text):
    """Run prediction on cleaned text, return career + confidence scores"""
    global model_pipeline

    if model_pipeline is None:
        load_model()

    cleaned = clean_text(text)

    predicted_career = model_pipeline.predict([cleaned])[0]
    probabilities = model_pipeline.predict_proba([cleaned])[0]
    classes = model_pipeline.classes_

    confidence_scores = {
        career: round(float(prob), 4) for career, prob in zip(classes, probabilities)
    }

    return {
        "predicted_career": predicted_career,
        "confidence_scores": confidence_scores,
        "confidence_pct": round(confidence_scores[predicted_career] * 100, 1),
    }


def extract_text_from_file(filepath):
    """Auto-detect file type and extract text"""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".docx":
        raw = extract_text_from_docx(filepath)
    elif ext == ".pdf":
        raw = extract_text_from_pdf(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return validate_extracted_text(raw)


def is_model_loaded():
    """Check if model is currently loaded"""
    return model_pipeline is not None
