from typing import Dict, List, Optional
from datetime import datetime
import json
from pathlib import Path
import uuid

from models.user_models import EcoCredit

class EcoCreditsSystem:
    """
    Manages eco-credits system for environmental contributions.
    """
    
    def __init__(self):
        self.credit_values = {
            "tree_planting": 50,
            "cleanup_drive": 30,
            "recycling": 20,
            "water_conservation": 25,
            "energy_conservation": 15,
            "public_transport": 10,
            "waste_reduction": 15,
            "green_commuting": 20,
            "environmental_reporting": 10
        }
        
        # Verification criteria
        self.verification_requirements = {
            "tree_planting": {"photo_required": True, "location_required": True},
            "cleanup_drive": {"photo_required": True, "location_required": True},
            "recycling": {"photo_required": True, "location_required": False},
            "water_conservation": {"photo_required": False, "location_required": False},
            "energy_conservation": {"photo_required": False, "location_required": False},
            "public_transport": {"photo_required": False, "location_required": True},
            "waste_reduction": {"photo_required": True, "location_required": False},
            "green_commuting": {"photo_required": False, "location_required": True},
            "environmental_reporting": {"photo_required": False, "location_required": True}
        }
    
    def submit_eco_action(self, user_id: str, action_type: str, description: str, 
                       photo_url: Optional[str] = None, location_lat: Optional[float] = None,
                       location_lon: Optional[float] = None) -> EcoCredit:
        """
        Submit an eco-action for credits.
        """
        # Validate action type
        if action_type not in self.credit_values:
            raise ValueError(f"Invalid action type: {action_type}")
        
        # Check verification requirements
        requirements = self.verification_requirements[action_type]
        # If verification materials are missing, accept the submission but mark
        # it as unverified for manual review instead of rejecting outright.
        if requirements.get("photo_required") and not photo_url:
            print(f"Note: photo missing for {action_type}; submission will be saved as unverified")

        if requirements.get("location_required") and (not location_lat or not location_lon):
            print(f"Note: location missing for {action_type}; submission will be saved as unverified")
        
        # Create eco credit entry
        credits_earned = self.credit_values[action_type]
        
        eco_credit = EcoCredit(
            user_id=user_id,
            action_type=action_type,
            photo_url=photo_url,
            location_lat=location_lat or 0.0,
            location_lon=location_lon or 0.0,
            description=description,
            credits_earned=credits_earned,
            verified=False,
            timestamp=datetime.now()
        )
        
        # Save to storage
        self._save_eco_credit(eco_credit)
        
        return eco_credit
    
    def get_user_credits(self, user_id: str) -> Dict:
        """
        Get total credits and breakdown for a user.
        """
        credits_file = Path("data/eco_credits.json")
        if not credits_file.exists():
            return {"total_credits": 0, "actions": []}
        
        try:
            with open(credits_file, "r") as f:
                all_credits = json.load(f)
            
            user_credits = [c for c in all_credits if c["user_id"] == user_id]
            
            total_credits = sum(c["credits_earned"] for c in user_credits if c.get("verified", True))
            
            # Breakdown by action type
            breakdown = {}
            for credit in user_credits:
                if credit.get("verified", True):
                    action = credit["action_type"]
                    breakdown[action] = breakdown.get(action, 0) + credit["credits_earned"]
            
            return {
                "total_credits": total_credits,
                "breakdown": breakdown,
                "actions": user_credits
            }
            
        except Exception as e:
            print(f"Error reading credits: {e}")
            return {"total_credits": 0, "actions": []}
    
    def verify_eco_credit(self, credit_id: str, verified_by: str) -> bool:
        """
        Verify an eco credit (admin function).
        """
        try:
            credits_file = Path("data/eco_credits.json")
            if not credits_file.exists():
                return False
            
            with open(credits_file, "r") as f:
                all_credits = json.load(f)
            
            # Find and update the credit
            for credit in all_credits:
                if credit.get("request_id") == credit_id:
                    credit["verified"] = True
                    credit["verified_by"] = verified_by
                    credit["verified_at"] = datetime.now().isoformat()
                    break
            
            # Save updated data
            with open(credits_file, "w") as f:
                json.dump(all_credits, f, indent=2)
            
            return True
            
        except Exception as e:
            print(f"Error verifying credit: {e}")
            return False
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """
        Get top users by eco credits.
        """
        credits_file = Path("data/eco_credits.json")
        if not credits_file.exists():
            return []
        
        try:
            with open(credits_file, "r") as f:
                all_credits = json.load(f)
            
            # Aggregate by user
            user_totals = {}
            for credit in all_credits:
                if credit.get("verified", True):
                    user_id = credit["user_id"]
                    user_totals[user_id] = user_totals.get(user_id, 0) + credit["credits_earned"]
            
            # Sort and return top users
            leaderboard = sorted(
                [{"user_id": uid, "total_credits": credits} for uid, credits in user_totals.items()],
                key=lambda x: x["total_credits"],
                reverse=True
            )
            
            return leaderboard[:limit]
            
        except Exception as e:
            print(f"Error generating leaderboard: {e}")
            return []
    
    def _save_eco_credit(self, eco_credit: EcoCredit):
        """
        Save eco credit to storage.
        """
        credits_file = Path("data/eco_credits.json")
        credits_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            # Load existing credits
            all_credits = []
            if credits_file.exists():
                with open(credits_file, "r") as f:
                    all_credits = json.load(f)
            
            # Add new credit
            credit_dict = {
                "request_id": str(uuid.uuid4()),
                "user_id": eco_credit.user_id,
                "action_type": eco_credit.action_type,
                "photo_url": eco_credit.photo_url,
                "location_lat": eco_credit.location_lat,
                "location_lon": eco_credit.location_lon,
                "description": eco_credit.description,
                "credits_earned": eco_credit.credits_earned,
                "verified": eco_credit.verified,
                "timestamp": eco_credit.timestamp.isoformat()
            }
            
            all_credits.append(credit_dict)
            
            # Save all credits
            with open(credits_file, "w") as f:
                json.dump(all_credits, f, indent=2)
                
        except Exception as e:
            print(f"Error saving eco credit: {e}")

    def get_pending_credits(self) -> List[Dict]:
        """
        Return list of eco credit submissions that are not yet verified.
        """
        credits_file = Path("data/eco_credits.json")
        if not credits_file.exists():
            return []

        try:
            with open(credits_file, "r") as f:
                all_credits = json.load(f)

            pending = [c for c in all_credits if not c.get("verified", False)]
            return pending
        except Exception as e:
            print(f"Error reading pending credits: {e}")
            return []
    
    def get_available_actions(self) -> Dict:
        """
        Get list of available eco actions and their credit values.
        """
        return {
            "actions": [
                {
                    "type": action_type,
                    "credits": credits,
                    "description": self._get_action_description(action_type),
                    "requirements": self.verification_requirements[action_type]
                }
                for action_type, credits in self.credit_values.items()
            ]
        }
    
    def _get_action_description(self, action_type: str) -> str:
        """Get description for eco action."""
        descriptions = {
            "tree_planting": "Plant a tree and contribute to reducing air pollution",
            "cleanup_drive": "Participate in a cleanup drive in your area",
            "recycling": "Recycle waste materials properly",
            "water_conservation": "Implement water conservation measures",
            "energy_conservation": "Reduce energy consumption",
            "public_transport": "Use public transport instead of private vehicles",
            "waste_reduction": "Reduce single-use plastic and other waste",
            "green_commuting": "Use bicycle or walk for short distances",
            "environmental_reporting": "Report environmental violations or concerns"
        }
        return descriptions.get(action_type, "Environmental action")
