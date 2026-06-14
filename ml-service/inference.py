import re
import joblib
import os
from docx import Document
import pdfplumber

# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "karrierlenz_model.pkl")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "models", "classes.pkl")

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
    text = re.sub(r'<[^>]+>', ' ', text)         # remove HTML tags
    text = re.sub(r'http\S+|www\S+', ' ', text)  # remove URLs
    text = re.sub(r'[^a-z\s]', ' ', text)        # keep only letters
    text = re.sub(r'\s+', ' ', text).strip()     # remove extra spaces
    return text

def extract_text_from_docx(filepath):
    """Extract text from DOCX — handles both paragraphs and tables"""
    doc = Document(filepath)
    full_text = []

    # Extract from paragraphs
    for para in doc.paragraphs:
        if para.text.strip():
            full_text.append(para.text.strip())

    # Extract from tables (most CV templates store text here)
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text.strip():
                    full_text.append(cell.text.strip())

    return " ".join(full_text)

def extract_text_from_pdf(filepath):
    """Extract text from PDF"""
    full_text = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text and text.strip():
                full_text.append(text.strip())
    return " ".join(full_text)

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
        career: round(float(prob), 4)
        for career, prob in zip(classes, probabilities)
    }

    return {
        "predicted_career": predicted_career,
        "confidence_scores": confidence_scores,
        "confidence_pct": round(confidence_scores[predicted_career] * 100, 1)
    }

def extract_text_from_file(filepath):
    """Auto-detect file type and extract text"""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".docx":
        return extract_text_from_docx(filepath)
    elif ext == ".pdf":
        return extract_text_from_pdf(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def is_model_loaded():
    """Check if model is currently loaded"""
    return model_pipeline is not None