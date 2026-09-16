import joblib
import numpy as np
import os

# Load model and feature columns
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, '..', 'ml_model', 'churn_model.pkl')
COLUMNS_PATH = os.path.join(BASE_DIR, '..', 'ml_model', 'feature_columns.pkl')

model = joblib.load(MODEL_PATH)
feature_columns = joblib.load(COLUMNS_PATH)

def predict_churn(customer_features: dict) -> dict:
    # Build feature vector in correct order
    values = [customer_features.get(col, 0) for col in feature_columns]
    X = np.array(values).reshape(1, -1)

    # Predict
    churn_prob = model.predict_proba(X)[0][1]
    churn_pred = int(churn_prob >= 0.5)

    return {
        "churn_probability": round(float(churn_prob), 4),
        "churn_prediction": churn_pred,
        "risk_level": "High" if churn_prob >= 0.7 else "Medium" if churn_prob >= 0.4 else "Low"
    }