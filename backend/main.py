from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd

from database import customers_collection
from model import predict_churn, feature_columns
from retention import identify_churn_reason, generate_retention_offer

app = FastAPI(title="TeleRetain AI", version="1.0.0")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "TeleRetain AI Backend is running ✅"}


# ─────────────────────────────────────────
# CUSTOMER MODEL
# ─────────────────────────────────────────
class Customer(BaseModel):
    customerID: str
    gender: int
    SeniorCitizen: int
    Partner: int
    Dependents: int
    tenure: int
    PhoneService: int
    MultipleLines: int
    OnlineSecurity: int
    OnlineBackup: int
    DeviceProtection: int
    TechSupport: int
    StreamingTV: int
    StreamingMovies: int
    PaperlessBilling: int
    MonthlyCharges: float
    TotalCharges: float
    InternetService_DSL: int
    InternetService_Fiber_optic: int = 0
    InternetService_No: int = 0
    Contract_Month_to_month: int = 0
    Contract_One_year: int = 0
    Contract_Two_year: int = 0
    PaymentMethod_Bank_transfer: int = 0
    PaymentMethod_Credit_card: int = 0
    PaymentMethod_Electronic_check: int = 0
    PaymentMethod_Mailed_check: int = 0


# ─────────────────────────────────────────
# ROUTE 1 — PREDICT CHURN
# ─────────────────────────────────────────
@app.post("/predict")
def predict(customer: Customer):
    # Convert to dict with correct column names
    data = {
        "gender": customer.gender,
        "SeniorCitizen": customer.SeniorCitizen,
        "Partner": customer.Partner,
        "Dependents": customer.Dependents,
        "tenure": customer.tenure,
        "PhoneService": customer.PhoneService,
        "MultipleLines": customer.MultipleLines,
        "OnlineSecurity": customer.OnlineSecurity,
        "OnlineBackup": customer.OnlineBackup,
        "DeviceProtection": customer.DeviceProtection,
        "TechSupport": customer.TechSupport,
        "StreamingTV": customer.StreamingTV,
        "StreamingMovies": customer.StreamingMovies,
        "PaperlessBilling": customer.PaperlessBilling,
        "MonthlyCharges": customer.MonthlyCharges,
        "TotalCharges": customer.TotalCharges,
        "InternetService_DSL": customer.InternetService_DSL,
        "InternetService_Fiber optic": customer.InternetService_Fiber_optic,
        "InternetService_No": customer.InternetService_No,
        "Contract_Month-to-month": customer.Contract_Month_to_month,
        "Contract_One year": customer.Contract_One_year,
        "Contract_Two year": customer.Contract_Two_year,
        "PaymentMethod_Bank transfer (automatic)": customer.PaymentMethod_Bank_transfer,
        "PaymentMethod_Credit card (automatic)": customer.PaymentMethod_Credit_card,
        "PaymentMethod_Electronic check": customer.PaymentMethod_Electronic_check,
        "PaymentMethod_Mailed check": customer.PaymentMethod_Mailed_check,
    }

    # Get prediction
    prediction = predict_churn(data)

    # Get churn reason and retention offer
    churn_reason = identify_churn_reason(data)
    offer = generate_retention_offer(churn_reason)

    # Save to MongoDB
    record = {
        "customerID": customer.customerID,
        "features": data,
        "churn_probability": prediction["churn_probability"],
        "churn_prediction": prediction["churn_prediction"],
        "risk_level": prediction["risk_level"],
        "churn_reason": churn_reason,
        "retention_offer": offer["offer"],
        "offer_type": offer["type"],
        "offer_priority": offer["priority"],
        "offer_status": "Pending"
    }
    customers_collection.update_one(
        {"customerID": customer.customerID},
        {"$set": record},
        upsert=True
    )

    return {
        "customerID": customer.customerID,
        "churn_probability": prediction["churn_probability"],
        "risk_level": prediction["risk_level"],
        "churn_reason": churn_reason,
        "retention_offer": offer["offer"],
        "offer_type": offer["type"],
        "offer_priority": offer["priority"]
    }


# ─────────────────────────────────────────
# ROUTE 2 — GET ALL CUSTOMERS
# ─────────────────────────────────────────
@app.get("/customers")
def get_customers():
    customers = list(customers_collection.find({}, {"_id": 0}))
    return {"total": len(customers), "customers": customers}


# ─────────────────────────────────────────
# ROUTE 3 — GET SINGLE CUSTOMER
# ─────────────────────────────────────────
@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    customer = customers_collection.find_one(
        {"customerID": customer_id}, {"_id": 0}
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


# ─────────────────────────────────────────
# ROUTE 4 — UPDATE OFFER STATUS
# ─────────────────────────────────────────
@app.patch("/customers/{customer_id}/offer-status")
def update_offer_status(customer_id: str, status: str):
    if status not in ["Pending", "Accepted", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    customers_collection.update_one(
        {"customerID": customer_id},
        {"$set": {"offer_status": status}}
    )
    return {"message": f"Offer status updated to {status}"}