import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import pickle
from pathlib import Path
from typing import Dict, Any, List

class SourceIdentifierML:
    def __init__(self, model_path: Path = None):
        self.model_path = model_path or Path(__file__).with_name("source_classifier.pkl")
        self.scaler_path = Path(__file__).with_name("source_scaler.pkl")
        self.model = None
        self.scaler = None
        self.feature_columns = ["PM2.5", "PM10", "NO2", "SO2", "CO", "OZONE", "overall_aqi"]
        
        if self.model_path.exists():
            self.load_model()
    
    def load_model(self):
        """Load trained model and scaler"""
        with open(self.model_path, "rb") as f:
            self.model = pickle.load(f)
        with open(self.scaler_path, "rb") as f:
            self.scaler = pickle.load(f)
    
    def save_model(self):
        """Save trained model and scaler"""
        Path(self.model_path).parent.mkdir(parents=True, exist_ok=True)
        with open(self.model_path, "wb") as f:
            pickle.dump(self.model, f)
        with open(self.scaler_path, "wb") as f:
            pickle.dump(self.scaler, f)
    
    def create_training_data(self) -> pd.DataFrame:
        """
        Create synthetic training data based on domain knowledge.
        In production, this would be replaced with real labeled data.
        """
        data = []
        
        # Traffic patterns
        for _ in range(100):
            data.append({
                "PM2.5": np.random.normal(80, 20),
                "PM10": np.random.normal(120, 30),
                "NO2": np.random.normal(70, 15),
                "SO2": np.random.normal(20, 10),
                "CO": np.random.normal(5, 2),
                "OZONE": np.random.normal(40, 15),
                "overall_aqi": np.random.normal(150, 30),
                "source": "traffic"
            })
        
        # Industry patterns
        for _ in range(100):
            data.append({
                "PM2.5": np.random.normal(100, 25),
                "PM10": np.random.normal(150, 35),
                "NO2": np.random.normal(90, 20),
                "SO2": np.random.normal(100, 25),
                "CO": np.random.normal(8, 3),
                "OZONE": np.random.normal(45, 20),
                "overall_aqi": np.random.normal(200, 40),
                "source": "industry"
            })
        
        # Construction patterns
        for _ in range(100):
            data.append({
                "PM2.5": np.random.normal(60, 15),
                "PM10": np.random.normal(200, 50),
                "NO2": np.random.normal(30, 10),
                "SO2": np.random.normal(25, 8),
                "CO": np.random.normal(2, 1),
                "OZONE": np.random.normal(30, 10),
                "overall_aqi": np.random.normal(180, 35),
                "source": "construction_or_road_dust"
            })
        
        # Urban background patterns
        for _ in range(100):
            data.append({
                "PM2.5": np.random.normal(40, 15),
                "PM10": np.random.normal(80, 25),
                "NO2": np.random.normal(40, 12),
                "SO2": np.random.normal(15, 8),
                "CO": np.random.normal(1.5, 0.8),
                "OZONE": np.random.normal(55, 18),
                "overall_aqi": np.random.normal(80, 25),
                "source": "urban_background"
            })
        
        # Clean background patterns
        for _ in range(100):
            data.append({
                "PM2.5": np.random.normal(15, 8),
                "PM10": np.random.normal(25, 10),
                "NO2": np.random.normal(10, 5),
                "SO2": np.random.normal(5, 3),
                "CO": np.random.normal(0.5, 0.3),
                "OZONE": np.random.normal(25, 12),
                "overall_aqi": np.random.normal(25, 10),
                "source": "clean_background"
            })
        
        return pd.DataFrame(data)
    
    def train_model(self):
        """Train the source identification model"""
        print("📊 Creating training data...")
        df = self.create_training_data()
        
        # Prepare features
        X = df[self.feature_columns].fillna(0)
        y = df["source"]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        print("\n📈 Model Performance:")
        print(classification_report(y_test, y_pred))
        
        # Save model
        self.save_model()
        print(f"✅ Model saved to {self.model_path}")
    
    def predict_source(self, station: Dict[str, Any]) -> str:
        """Predict source for a single station"""
        if self.model is None or self.scaler is None:
            return "unknown"
        
        # Extract features
        features = []
        for col in self.feature_columns:
            val = station.get(col, 0)
            if val is None:
                val = 0
            features.append(float(val))
        
        # Scale and predict
        features_scaled = self.scaler.transform([features])
        prediction = self.model.predict(features_scaled)[0]
        confidence = max(self.model.predict_proba(features_scaled)[0])
        
        # Return prediction if confidence is high enough
        if confidence > 0.3:  # 30% confidence threshold
            return prediction
        return "unknown"
    
    def predict_sources_for_stations(self, stations: List[Dict[str, Any]]) -> List[str]:
        """Predict sources for multiple stations"""
        return [self.predict_source(station) for station in stations]

def train_source_identifier():
    """Train the source identification model"""
    classifier = SourceIdentifierML()
    classifier.train_model()
    return classifier

if __name__ == "__main__":
    train_source_identifier()
