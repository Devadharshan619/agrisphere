from pydantic import BaseModel
from typing import List

class YieldPredictionInput(BaseModel):
    crop_type: str
    farm_area: float
    soil_type: str
    rainfall_mm: float
    temperature_c: float

class HealthAnalysisInput(BaseModel):
    ndvi_values: List[float] # Time series or multi-spectral array points

class CreditScoreInput(BaseModel):
    farm_area: float
    historical_yields: List[float]
    loan_history_score: float # 0.0 to 1.0 (1.0 = good history)
    weather_risk_factor: float # 0.0 to 1.0 (1.0 = high risk)
