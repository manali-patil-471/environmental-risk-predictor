from typing import Dict, List, Optional
from datetime import datetime
import numpy as np

from models.user_models import UserProfile, HealthAdvice, HealthCondition, AgeGroup

class PersonalizedHealthEngine:
    """
    Provides personalized health recommendations based on AQI levels and user profiles.
    """
    
    def __init__(self):
        # Risk multipliers for different health conditions
        self.risk_multipliers = {
            HealthCondition.HEALTHY: 1.0,
            HealthCondition.ASTHMA: 2.5,
            HealthCondition.HEART_DISEASE: 2.0,
            HealthCondition.ELDERLY: 1.8,
            HealthCondition.CHILDREN: 1.6,
            HealthCondition.PREGNANT: 2.2
        }
        
        # Age-based sensitivity
        self.age_sensitivity = {
            AgeGroup.CHILD: 1.5,
            AgeGroup.TEEN: 1.2,
            AgeGroup.ADULT: 1.0,
            AgeGroup.ELDERLY: 1.7
        }
    
    def calculate_personal_risk(self, aqi: int, user_profile: UserProfile) -> Dict:
        """
        Calculate personalized risk assessment based on AQI and user profile.
        """
        base_risk = self._get_base_risk_level(aqi)
        
        # Apply health condition multipliers
        health_multiplier = 1.0
        for condition in user_profile.health_conditions:
            health_multiplier = max(health_multiplier, self.risk_multipliers.get(condition, 1.0))
        
        # Apply age sensitivity
        age_multiplier = self.age_sensitivity.get(user_profile.age_group, 1.0)
        
        # Calculate adjusted risk
        adjusted_risk_score = aqi * health_multiplier * age_multiplier
        personal_risk_level = self._get_base_risk_level(int(adjusted_risk_score))
        
        return {
            "original_aqi": aqi,
            "adjusted_risk_score": adjusted_risk_score,
            "base_risk_level": base_risk,
            "personal_risk_level": personal_risk_level,
            "health_multiplier": health_multiplier,
            "age_multiplier": age_multiplier,
            "risk_increase_factor": adjusted_risk_score / aqi if aqi > 0 else 1.0
        }
    
    def generate_health_advice(self, aqi: int, user_profile: UserProfile) -> HealthAdvice:
        """
        Generate personalized health recommendations.
        """
        risk_assessment = self.calculate_personal_risk(aqi, user_profile)
        personal_risk_level = risk_assessment["personal_risk_level"]
        
        # Generate recommendations based on risk level
        recommendations = self._get_base_recommendations(aqi)
        activities_to_avoid = self._get_activities_to_avoid(personal_risk_level)
        protective_measures = self._get_protective_measures(personal_risk_level)
        medical_advice = self._get_medical_advice(user_profile.health_conditions, risk_assessment["base_risk_level"])
        
        # Personalize recommendations
        personalized_recommendations = self._personalize_recommendations(
            recommendations, user_profile
        )
        
        return HealthAdvice(
            user_id=user_profile.user_id,
            aqi_level=aqi,
            risk_level=risk_assessment["base_risk_level"],
            personal_risk_assessment=self._get_risk_description(risk_assessment),
            recommendations=personalized_recommendations,
            activities_to_avoid=activities_to_avoid,
            protective_measures=protective_measures,
            medical_advice=medical_advice
        )
    
    def _get_base_risk_level(self, aqi: int) -> str:
        """Get base risk level from AQI."""
        if aqi <= 50:
            return "good"
        elif aqi <= 100:
            return "satisfactory"
        elif aqi <= 200:
            return "moderate"
        elif aqi <= 300:
            return "poor"
        elif aqi <= 400:
            return "very_poor"
        else:
            return "severe"
    
    def _get_base_recommendations(self, aqi: int) -> List[str]:
        """Get general recommendations based on AQI."""
        if aqi <= 50:
            return ["Enjoy outdoor activities", "Air quality is satisfactory"]
        elif aqi <= 100:
            return ["Sensitive individuals should consider limiting prolonged outdoor exertion"]
        elif aqi <= 200:
            return ["Limit outdoor activities", "Consider wearing masks outdoors"]
        elif aqi <= 300:
            return ["Avoid outdoor activities", "Wear N95 masks if going outside"]
        else:
            return ["Stay indoors", "Use air purifiers", "Seek medical attention if experiencing symptoms"]
    
    def _get_activities_to_avoid(self, risk_level: str) -> List[str]:
        """Get activities to avoid based on risk level."""
        if risk_level in ["good", "satisfactory"]:
            return []
        elif risk_level == "moderate":
            return ["Prolonged outdoor exercise", "Strenuous outdoor activities"]
        elif risk_level == "poor":
            return ["Outdoor sports", "Jogging", "Cycling", "Outdoor gatherings"]
        else:  # very_poor, severe
            return ["All outdoor activities", "Opening windows", "Using fans without filtration"]
    
    def _get_protective_measures(self, risk_level: str) -> List[str]:
        """Get protective measures based on risk level."""
        if risk_level in ["good", "satisfactory"]:
            return ["Monitor air quality regularly"]
        elif risk_level == "moderate":
            return ["Close windows during peak pollution hours", "Use air purifiers indoors"]
        elif risk_level == "poor":
            return ["Wear N95 masks outdoors", "Keep windows closed", "Use HEPA filters"]
        else:  # very_poor, severe
            return ["Stay indoors", "Seal windows and doors", "Use air purifiers on high", "Wear PPE if must go out"]
    
    def _get_medical_advice(self, health_conditions: List[HealthCondition], risk_level: str) -> Optional[str]:
        """Get specific medical advice based on health conditions."""
        if risk_level in ["good", "satisfactory"]:
            return None
        
        advice = []
        if HealthCondition.ASTHMA in health_conditions:
            advice.append("Keep inhaler readily available")
            advice.append("Consult doctor about adjusting medication")
        
        if HealthCondition.HEART_DISEASE in health_conditions:
            advice.append("Monitor blood pressure closely")
            advice.append("Avoid strenuous activities completely")
        
        if HealthCondition.ELDERLY in health_conditions or AgeGroup.ELDERLY in [AgeGroup.ELDERLY]:
            advice.append("Ensure assistance is available")
            advice.append("Check in regularly with family")
        
        if HealthCondition.PREGNANT in health_conditions:
            advice.append("Consult obstetrician for specific guidance")
            advice.append("Avoid all unnecessary outdoor exposure")
        
        return "; ".join(advice) if advice else None
    
    def _personalize_recommendations(self, recommendations: List[str], user_profile: UserProfile) -> List[str]:
        """Personalize general recommendations based on user profile."""
        personalized = recommendations.copy()
        
        # Age-specific personalization
        if user_profile.age_group == AgeGroup.CHILD:
            personalized.append("Ensure children play indoors during high pollution")
        elif user_profile.age_group == AgeGroup.ELDERLY:
            personalized.append("Arrange for grocery/medicine delivery during high pollution days")
        
        # Health condition specific
        if HealthCondition.ASTHMA in user_profile.health_conditions:
            personalized.append("Keep rescue inhaler accessible at all times")
        
        return personalized
    
    def _get_risk_description(self, risk_assessment: Dict) -> str:
        """Generate human-readable risk description."""
        base_risk = risk_assessment.get("base_risk_level", "unknown")
        increase_factor = risk_assessment.get("risk_increase_factor", 1.0)
        
        if increase_factor <= 1.2:
            return f"Normal risk level ({base_risk}) for your profile"
        elif increase_factor <= 1.5:
            return f"Slightly elevated risk ({base_risk} → higher for you)"
        elif increase_factor <= 2.0:
            return f"Moderately elevated risk ({base_risk} → significantly higher for you)"
        else:
            return f"High risk level ({base_risk} → severe for your health condition)"
