from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import YieldPredictionInput, HealthAnalysisInput, CreditScoreInput
import random

app = FastAPI(title="AgriSphere AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AgriSphere AI Microservice Running"}

@app.post("/predict-yield")
def predict_yield(data: YieldPredictionInput):
    # Stub: In a real system, this would load a Scikit-Learn or TensorFlow model and run inference.
    # Yield prediction formula (dummy logic for demonstration)
    base_yield = data.farm_area * 3.5 # tons per hectare average
    
    if data.soil_type.lower() == "loam":
        base_yield *= 1.2
    
    if data.rainfall_mm > 500:
        base_yield *= 1.1

    predicted_yield = base_yield * (random.uniform(0.9, 1.1))
    
    return {
        "success": True, 
        "predicted_yield_tons": round(predicted_yield, 2),
        "confidence": round(random.uniform(0.85, 0.95), 2)
    }

@app.post("/crop-health-analysis")
def crop_health_analysis(data: HealthAnalysisInput):
    # Stub: Compute average NDVI
    if not data.ndvi_values:
        return {"success": False, "message": "No NDVI data provided"}
        
    avg_ndvi = sum(data.ndvi_values) / len(data.ndvi_values)
    
    status = "Healthy"
    if avg_ndvi < 0.3:
        status = "Severe Stress (Drought/Disease)"
    elif avg_ndvi < 0.6:
        status = "Moderate Stress"
        
    return {
        "success": True,
        "average_ndvi": round(avg_ndvi, 2),
        "health_status": status,
        "recommendation": "Increase irrigation immediately" if avg_ndvi < 0.6 else "Maintain current schedule"
    }

@app.post("/credit-score")
def evaluate_credit(data: CreditScoreInput):
    # Stub: Machine learning credit risk model evaluation
    score = 500 # Base score

    # Factor 1: Farm Area (larger = more collateral/capacity)
    score += min(data.farm_area * 10, 150)
    
    # Factor 2: Historical Yields average
    if data.historical_yields:
        avg_yield = sum(data.historical_yields) / len(data.historical_yields)
        score += min(avg_yield * 20, 150)
        
    # Factor 3: Loan History
    score += (data.loan_history_score * 100)
    
    # Factor 4: Weather Risk (higher risk = lower score)
    score -= (data.weather_risk_factor * 100)
    
    # Bound score between 300 and 850
    final_score = max(300, min(850, int(score)))
    
    eligibility = "Approved" if final_score > 650 else ("Review Required" if final_score > 550 else "Rejected")

    return {
        "success": True,
        "credit_score": final_score,
        "eligibility": eligibility,
        "max_loan_estimate": int(data.farm_area * 5000) if final_score > 650 else 0
    }
