from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class HealthCondition(str, Enum):
    HEALTHY = "healthy"
    ASTHMA = "asthma"
    HEART_DISEASE = "heart_disease"
    ELDERLY = "elderly"
    CHILDREN = "children"
    PREGNANT = "pregnant"

class AgeGroup(str, Enum):
    CHILD = "child"
    TEEN = "teen"
    ADULT = "adult"
    ELDERLY = "elderly"

class UserProfile(BaseModel):
    user_id: str
    name: str
    email: str
    age: int
    age_group: AgeGroup
    health_conditions: List[HealthCondition] = []
    location_lat: float
    location_lon: float
    city: str
    state: str
    notification_preferences: dict = {
        "high_risk": True,
        "moderate_risk": True,
        "daily_summary": True
    }

class HealthAdvice(BaseModel):
    user_id: str
    aqi_level: int
    risk_level: str
    personal_risk_assessment: str
    recommendations: List[str]
    activities_to_avoid: List[str]
    protective_measures: List[str]
    medical_advice: Optional[str] = None

class NotificationMessage(BaseModel):
    user_id: str
    message: str
    priority: str  # high, medium, low
    notification_type: str  # health_alert, risk_warning, daily_summary
    timestamp: datetime
    expires_at: Optional[datetime] = None

class EcoCredit(BaseModel):
    user_id: str
    action_type: str  # tree_planting, cleanup, recycling, etc.
    photo_url: Optional[str] = None
    location_lat: float
    location_lon: float
    description: str
    credits_earned: int
    verified: bool = False
    timestamp: datetime

class MunicipalRequest(BaseModel):
    request_id: str
    location_lat: float
    location_lon: float
    risk_level: str
    pollution_source: str
    recommended_action: str
    urgency: str  # high, medium, low
    authority_type: str  # municipal, pollution_board, traffic_police
    status: str = "pending"  # pending, acknowledged, resolved
    created_at: datetime
    resolved_at: Optional[datetime] = None
