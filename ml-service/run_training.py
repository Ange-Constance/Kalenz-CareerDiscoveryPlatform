"""
Train TF-IDF + Logistic Regression model for career classification.
Run: python train_model.py
"""

import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from train_model import generate_training_samples, CAREERS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def main():
    print("Generating training data...")
    texts, labels = generate_training_samples(samples_per_career=32)
    print(f"Total samples: {len(texts)}")

    vectorizer = TfidfVectorizer(
        max_features=20,
        stop_words="english",
        lowercase=True,
        ngram_range=(1, 2),
    )

    X = vectorizer.fit_transform(texts)
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X.toarray())

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, labels, test_size=0.2, random_state=42, stratify=labels
    )

    model = LogisticRegression(
        multi_class="multinomial",
        max_iter=1000,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=CAREERS))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    joblib.dump(vectorizer, os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
    joblib.dump(model, os.path.join(MODELS_DIR, "logistic_regression.pkl"))
    joblib.dump(CAREERS, os.path.join(MODELS_DIR, "careers.pkl"))

    print(f"\nModels saved to {MODELS_DIR}/")

    sample_text = "REST API Node.js PostgreSQL backend microservices authentication"
    probs = model.predict_proba(scaler.transform(vectorizer.transform([sample_text]).toarray()))[0]
    ranked = sorted(zip(CAREERS, probs), key=lambda x: x[1], reverse=True)
    print("\nSample inference (Backend text):")
    for name, prob in ranked:
        print(f"  {name}: {prob:.1%}")


if __name__ == "__main__":
    main()
