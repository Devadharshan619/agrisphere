from pydantic import BaseModel
from typing import List

class YieldPredictionRequest(BaseModel):
    crop_type: str
    soil_moisture: float
    temperature: float
    rainfall: float
    farm_size_acres: float

class CreditScoreRequest(BaseModel):
    farmer_id: str
    annual_income: float
    farm_size_acres: float
    previous_loan_defaults: int
    average_yearly_yield_value: float

class HealthAnalysisRequest(BaseModel):
    farm_id: str
    ndvi_values: List[float]
    soil_moisture: float = 35.0
    spectral_bands: List[float] = [0.12, 0.45, 0.33, 0.1] # Simulated R,G,B,NIR values

class GrowthForecastRequest(BaseModel):
    farm_id: str
    current_ndvi: float
    historical_ndvi: List[float]
    forecast_days: int = 7