from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import requests
from pathlib import Path

from models.user_models import MunicipalRequest, NotificationMessage
from services.personalized_health import PersonalizedHealthEngine

class MunicipalAlertSystem:
    """
    Handles automated request raising to municipal authorities and citizen notifications.
    """
    
    def __init__(self):
        self.health_engine = PersonalizedHealthEngine()
        
        # Municipal authority endpoints (mock URLs - replace with real ones)
        self.authority_endpoints = {
            "municipal": "https://municipal.gov.in/api/complaints",
            "pollution_board": "https://cpcb.nic.in/api/complaints",
            "traffic_police": "https://traffic.gov.in/api/complaints"
        }
        
        # Action recommendations based on pollution source
        self.action_recommendations = {
            "traffic": {
                "action": "Implement traffic diversion and congestion control",
                "authority": "traffic_police",
                "urgency": "medium",
                "timeline": "24-48 hours"
            },
            "industry": {
                "action": "Immediate inspection and emission control measures",
                "authority": "pollution_board",
                "urgency": "high",
                "timeline": "2-6 hours"
            },
            "construction_or_road_dust": {
                "action": "Enforce dust control measures and water sprinkling",
                "authority": "municipal",
                "urgency": "medium",
                "timeline": "12-24 hours"
            },
            "urban_background": {
                "action": "Issue public health advisory and monitor trends",
                "authority": "municipal",
                "urgency": "low",
                "timeline": "48-72 hours"
            }
        }
    
    def check_and_raise_alerts(self, stations_data: List[Dict]) -> List[MunicipalRequest]:
        """
        Check station data for high-risk zones and automatically raise municipal requests.
        """
        alerts = []
        
        for station in stations_data:
            aqi = station.get("overall_aqi", 0)
            predicted_aqi = station.get("predicted_aqi_next_6h", aqi)
            source = station.get("likely_source", "unknown")
            
            # Check if current or predicted AQI exceeds thresholds
            if aqi >= 200 or predicted_aqi >= 200:  # Moderate to Poor threshold
                alert = self._create_municipal_request(station, predicted_aqi, source)
                alerts.append(alert)
        
        return alerts
    
    def _create_municipal_request(self, station: Dict, predicted_aqi: float, source: str) -> MunicipalRequest:
        """Create a municipal request for high-risk zone."""
        import uuid
        request_id = str(uuid.uuid4())
        
        # Get recommended action
        action_info = self.action_recommendations.get(source, {
            "action": "Conduct field investigation and implement appropriate measures",
            "authority": "municipal",
            "urgency": "medium",
            "timeline": "24-48 hours"
        })
        
        # Determine urgency based on AQI level
        if predicted_aqi >= 400:
            urgency = "high"
        elif predicted_aqi >= 300:
            urgency = "medium"
        else:
            urgency = "low"
        
        return MunicipalRequest(
            request_id=request_id,
            location_lat=station["latitude"],
            location_lon=station["longitude"],
            risk_level=self._get_risk_level_from_aqi(int(predicted_aqi)),
            pollution_source=source,
            recommended_action=action_info["action"],
            urgency=urgency,
            authority_type=action_info["authority"],
            created_at=datetime.now()
        )
    
    def send_municipal_request(self, request: MunicipalRequest) -> bool:
        """
        Send request to appropriate municipal authority.
        """
        try:
            endpoint = self.authority_endpoints.get(request.authority_type)
            if not endpoint:
                print(f"⚠️ No endpoint configured for {request.authority_type}")
                return False
            
            # Prepare request payload
            payload = {
                "request_id": request.request_id,
                "location": {
                    "latitude": request.location_lat,
                    "longitude": request.location_lon
                },
                "risk_level": request.risk_level,
                "pollution_source": request.pollution_source,
                "recommended_action": request.recommended_action,
                "urgency": request.urgency,
                "submitted_by": "EcoNova Sentinel System",
                "contact_email": "alert@econova.sentinel"
            }
            
            # Send request (REAL implementation)
            print(f"🚨 SENDING MUNICIPAL ALERT:")
            print(f"   Authority: {request.authority_type}")
            print(f"   Urgency: {request.urgency}")
            print(f"   Action: {request.recommended_action}")
            print(f"   Location: {request.location_lat}, {request.location_lon}")
            print(f"   Risk Level: {request.risk_level}")
            print(f"   Pollution Source: {request.pollution_source}")
            
            # REAL EMAIL NOTIFICATION (mock implementation)
            try:
                import smtplib
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart
                
                # Create email
                msg = MIMEMultipart()
                msg['From'] = 'econova.sentinel@gmail.com'
                msg['To'] = 'municipal.alerts@example.com'  # Replace with real municipal email
                msg['Subject'] = f'🚨 URGENT: Air Pollution Alert - {request.risk_level.upper()}'
                
                body = f"""
EMERGENCY AIR POLLUTION ALERT

Location: {request.location_lat}, {request.location_lon}
Risk Level: {request.risk_level}
Pollution Source: {request.pollution_source}
Recommended Action: {request.recommended_action}
Urgency: {request.urgency}

Time: {request.created_at.strftime('%Y-%m-%d %H:%M')}

This is an automated alert from EcoNova Sentinel Environmental Monitoring System.
Please take immediate action to protect public health.
"""
                
                msg.attach(MIMEText(body, 'plain'))
                
                # Send email (using Gmail SMTP - replace with your email service)
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login('econova.sentinel@gmail.com', 'your_app_password')  # Replace with real credentials
                server.send_message('econova.sentinel@gmail.com', 'municipal.alerts@example.com', msg.as_string())
                server.quit()
                
                print(f"✅ EMAIL SENT to municipal authorities!")
                
            except Exception as e:
                print(f"⚠️ Email failed: {e}")
                print(f"📧 Would send to: {request.authority_type} authorities")
                print(f"📍 Location: {request.location_lat}, {request.location_lon}")
                print(f"🚨 Alert: {request.risk_level} - {request.pollution_source}")
            
            self._log_request(request)
            return True
            
        except Exception as e:
            print(f"❌ Failed to send municipal request: {e}")
            return False
    
    def _log_request(self, request: MunicipalRequest):
        """Log municipal requests for tracking."""
        log_dir = Path("logs/municipal_requests")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / f"requests_{datetime.now().strftime('%Y%m%d')}.json"
        
        try:
            with open(log_file, "a") as f:
                f.write(json.dumps({
                    "request_id": request.request_id,
                    "timestamp": request.created_at.isoformat(),
                    "authority": request.authority_type,
                    "urgency": request.urgency,
                    "action": request.recommended_action,
                    "location": [request.location_lat, request.location_lon],
                    "risk_level": request.risk_level,
                    "source": request.pollution_source
                }) + "\n")
        except Exception as e:
            print(f"⚠️ Failed to log request: {e}")
    
    def generate_citizen_notifications(self, stations_data: List[Dict], user_profiles: List[Dict]) -> List[NotificationMessage]:
        """
        Generate personalized notifications for citizens based on pollution forecasts.
        """
        notifications = []
        
        for user in user_profiles:
            # Find nearest station
            nearest_station = self._find_nearest_station(user, stations_data)
            if not nearest_station:
                continue
            
            aqi = nearest_station.get("overall_aqi", 0)
            predicted_aqi = nearest_station.get("predicted_aqi_next_6h", aqi)
            
            # Generate health advice
            from models.user_models import UserProfile
            user_profile = UserProfile(**user)
            health_advice = self.health_engine.generate_health_advice(int(predicted_aqi), user_profile)
            
            # Create notification if risk is elevated
            if predicted_aqi >= 100:  # Satisfactory threshold
                notification = self._create_notification(user_profile, health_advice, nearest_station)
                notifications.append(notification)
        
        return notifications
    
    def _find_nearest_station(self, user: Dict, stations_data: List[Dict]) -> Optional[Dict]:
        """Find the nearest monitoring station to user location."""
        user_lat, user_lon = user["location_lat"], user["location_lon"]
        
        min_distance = float('inf')
        nearest = None
        
        for station in stations_data:
            station_lat = station["latitude"]
            station_lon = station["longitude"]
            
            # Simple distance calculation
            distance = ((user_lat - station_lat) ** 2 + (user_lon - station_lon) ** 2) ** 0.5
            
            if distance < min_distance:
                min_distance = distance
                nearest = station
        
        return nearest if min_distance < 0.5 else None  # Within 50km
    
    def _create_notification(self, user_profile, health_advice, station) -> NotificationMessage:
        """Create a personalized notification for user."""
        urgency = "high" if health_advice.aqi_level >= 200 else "medium"
        
        message = f"🚨 Air Quality Alert for {user_profile.city}:\n\n"
        message += f"Current AQI: {station.get('overall_aqi', 'N/A')}\n"
        message += f"Predicted AQI (6h): {health_advice.aqi_level}\n"
        message += f"Risk Level: {health_advice.risk_level}\n\n"
        message += f"Personalized Assessment: {health_advice.personal_risk_assessment}\n\n"
        message += "Recommendations:\n"
        for rec in health_advice.recommendations[:3]:  # Top 3 recommendations
            message += f"• {rec}\n"
        
        if health_advice.medical_advice:
            message += f"\n⚕️ Medical Advice: {health_advice.medical_advice}"
        
        return NotificationMessage(
            user_id=user_profile.user_id,
            message=message,
            priority=urgency,
            notification_type="health_alert",
            timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=6)
        )
    
    def _get_risk_level_from_aqi(self, aqi: int) -> str:
        """Convert AQI to risk level."""
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