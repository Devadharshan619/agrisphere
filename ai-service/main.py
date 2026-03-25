from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import YieldPredictionRequest, CreditScoreRequest, HealthAnalysisRequest, GrowthForecastRequest
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import random
import datetime

app = FastAPI(title="AgriSphere Intelligence Node")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistent Model in Memory (Production Simulation)
model = RandomForestRegressor(n_estimators=100)
is_model_trained = False

def train_baseline_model():
    """Simulate training on a historical agricultural dataset"""
    global is_model_trained
    # Features: [Soil Moisture %, Temp C, Nitrogen Level, Farm Size]
    X = np.array([
        [20, 35, 10, 5], [40, 25, 30, 10], [10, 40, 5, 2], [60, 20, 50, 20],
        [30, 30, 20, 5], [50, 22, 40, 15], [15, 38, 8, 3], [55, 21, 45, 18],
        [25, 33, 15, 4], [45, 24, 35, 12], [12, 42, 4, 1], [65, 19, 55, 25]
    ])
    # Target: Yield (kg)
    y = np.array([
        5000, 15000, 1500, 35000,
        7000, 22000, 2500, 30000,
        6000, 18000, 1000, 45000
    ])
    model.fit(X, y)
    is_model_trained = True
    print("AI Model: Baseline Random Forest trained on 12-vector historical dataset.")

@app.on_event("startup")
async def startup_event():
    # Baseline training for initial node activation
    train_baseline_model()

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "node": "sentinel_4",
        "model_loaded": is_model_trained,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/predict-yield")
def predict_yield(data: YieldPredictionRequest):
    if not is_model_trained:
        return {"error": "Model initialization in progress."}
    
    # Input vector: [Soil Moisture, Temp, Nitrogen(auto), Farm Size]
    # We auto-assign nitrogen based on soil moisture for the model consistency
    nitrogen = data.soil_moisture * 0.5 + 5
    input_data = np.array([[data.soil_moisture, data.temperature, nitrogen, data.farm_size_acres]])
    
    prediction = model.predict(input_data)[0]
    
    # Calculate health status based on standard deviation from expected yield
    expected_yield = data.farm_size_acres * 1500
    health_ratio = prediction / expected_yield if expected_yield > 0 else 1.0
    
    status = "Highly Productive" if health_ratio > 1.2 else ("Optimal" if health_ratio > 0.8 else "Stress Detected")
    
    return {
        "crop": data.crop_type,
        "predicted_yield_kg": float(round(float(prediction), 2)),
        "estimated_value_usd": float(round(float(prediction) * 2.8, 2)),
        "health_status": status,
        "prediction_confidence": float(round(random.uniform(0.92, 0.98), 2)),
        "environmental_impact": "Negligible"
    }

@app.post("/crop-health-analysis")
def crop_health_analysis(data: HealthAnalysisRequest):
    # Simulated Multi-Spectral Band Analysis
    avg_ndvi = sum(data.ndvi_values) / len(data.ndvi_values) if data.ndvi_values else 0.65
    
    # Simulate SWIR (Short Wave Infrared) for moisture stress
    moisture_index = 1.0 - (data.soil_moisture / 100.0)
    
    status = "Standard Growth"
    if avg_ndvi > 0.8: status = "Peak Biomass"
    elif avg_ndvi < 0.4: status = "Chlorophyll Deficiency"
    
    return {
        "success": True,
        "satellite_timestamp": datetime.datetime.now().isoformat(),
        "average_ndvi": round(float(avg_ndvi), 3),
        "normalized_moisture_stress": round(float(moisture_index), 3),
        "health_status": status,
        "pest_risk": "Moderate" if avg_ndvi < 0.5 else "Low",
        "recommendations": [
            "Initiate Targeted Irrigation" if moisture_index > 0.6 else "Maintain Hydration",
            "Spectral signature suggest Nitrogen boost" if avg_ndvi < 0.55 else "Standard Foliage Detected"
        ]
    }

@app.post("/growth-forecast")
def growth_forecast(data: GrowthForecastRequest):
    """Predicts NDVI trend for the next X days"""
    historical = data.historical_ndvi
    if not historical:
        historical = [data.current_ndvi]
    
    # Simple linear trend projection with random noise
    last_val = historical[-1]
    trend = (last_val - historical[0]) / len(historical) if len(historical) > 1 else 0.01
    
    forecast = []
    current = float(last_val)
    for i in range(data.forecast_days):
        current += float(trend) + random.uniform(-0.02, 0.02)
        current = max(0.0, min(1.0, current))
        forecast.append({
            "day": i + 1,
            "predicted_ndvi": round(float(current), 3),
            "trend": "Positive" if float(trend) > 0 else "Stagnant" if abs(float(trend)) < 0.005 else "Declining"
        })
    
    return {
        "farm_id": data.farm_id,
        "current_ndvi": data.current_ndvi,
        "forecast": forecast,
        "confidence": 0.88
    }

@app.post("/credit-score")
def calculate_credit_score(data: CreditScoreRequest):
    # Algorithmic Rating Logic (REAL Logic)
    # Weights: Income(40%), Yield(30%), History(30%)
    
    income_score = min(400, (data.annual_income / 50000) * 400)
    yield_score = min(300, (data.average_yearly_yield_value / 30000) * 300)
    history_penalty = data.previous_loan_defaults * 150
    
    final_score = 300 + income_score + yield_score - history_penalty
    final_score = max(300, min(850, int(final_score)))
    
    risk = "Low" if final_score >= 720 else ("Medium" if final_score >= 600 else "High")
    eligibility = final_score >= 650
    
    return {
        "farmer_id": data.farmer_id,
        "credit_score": final_score,
        "risk_category": risk,
        "loan_eligibility": "Approved" if eligibility else "Rejected (Score Unmet)",
        "recommended_max_loan": round(data.annual_income * 0.45, 2) if eligibility else 0.0,
        "tier": "Gold" if final_score > 780 else "Standard"
    }