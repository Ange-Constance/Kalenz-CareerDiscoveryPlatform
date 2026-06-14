"""Synthetic training data generator for KarrerLenz ML pipeline."""

CAREERS = ["UX Research", "Health Data", "Policy", "Backend", "DevOps"]

CAREER_KEYWORDS = {
    "UX Research": [
        "user research usability testing interviews personas wireframes prototypes",
        "stakeholder feedback design thinking empathy user experience qualitative",
        "surveys A/B testing journey mapping accessibility heuristics evaluation",
    ],
    "Health Data": [
        "healthcare data analysis SQL clinical datasets FHIR HL7 biomedical",
        "patient records epidemiology public health statistics dashboards insights",
        "medical research data cleaning visualization pandas healthcare analytics",
    ],
    "Policy": [
        "policy analysis regulatory framework governance legislation recommendations",
        "stakeholder engagement research briefs tech policy digital economy",
        "impact assessment compliance regulatory technology law advocacy",
    ],
    "Backend": [
        "REST API Node.js Express PostgreSQL database architecture scalability",
        "microservices authentication JWT server-side design patterns backend",
        "Python Django Flask SQL queries caching performance optimization",
    ],
    "DevOps": [
        "Docker Kubernetes CI/CD pipeline deployment automation infrastructure",
        "AWS cloud Terraform monitoring logging GitHub Actions containerization",
        "Linux shell scripting DevOps SRE reliability scalability automation",
    ],
}

COMPETENCY_KEYWORDS = {
    "systems_thinking": ["architecture", "scalability", "design patterns", "system", "infrastructure"],
    "communication": ["documented", "explained", "clear", "readme", "presentation", "written"],
    "empathy": ["user", "stakeholder", "feedback", "designed", "empathy", "customer"],
    "data_analysis": ["data", "analysis", "sql", "insight", "analytics", "metrics"],
    "analytical_depth": ["detailed", "comprehensive", "thorough", "research", "investigation"],
    "collaboration": ["team", "collaborated", "contributed", "pair", "agile", "scrum"],
}

def generate_training_samples(samples_per_career=32):
    """Generate synthetic training samples mimicking CV/job posting text."""
    texts = []
    labels = []

    for career_idx, career in enumerate(CAREERS):
        keywords_list = CAREER_KEYWORDS[career]
        for i in range(samples_per_career):
            base = keywords_list[i % len(keywords_list)]
            variation = f"professional experience in {career.lower()} {base} project portfolio skills"
            texts.append(variation)
            labels.append(career_idx)

    return texts, labels


def compute_competencies(text):
    """Score competencies based on keyword presence in text."""
    lower = text.lower()
    competencies = {}
    for skill, keywords in COMPETENCY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower) / len(keywords)
        competencies[skill] = min(1.0, score * 2)
    return competencies
