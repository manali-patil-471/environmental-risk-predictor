import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Station {
  station: string;
  city: string;
  latitude: number;
  longitude: number;
  overall_aqi: number;
  current_risk_level: string;
  predicted_aqi_next_6h?: number;
  likely_source: string;
  source_method: string;
}

function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await axios.get('http://localhost:8001/live-data');
        console.log('Backend response:', response.data); // Debug log
        
        // Handle different possible data structures
        let stationsData = response.data;
        if (response.data.data) {
          stationsData = response.data.data;
        }
        
        // Ensure it's an array
        const stationsArray = Array.isArray(stationsData) ? stationsData : [];
        
        setStations(stationsArray);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchLiveData();
  }, []);

    const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'good': return 'risk-good';
      case 'satisfactory': return 'risk-satisfactory';
      case 'moderate': return 'risk-moderate';
      case 'poor': return 'risk-poor';
      case 'very_poor': return 'risk-very-poor';
      case 'severe': return 'risk-severe';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🌍 EcoNova Sentinel
          </h1>
          <p className="text-gray-600">Environmental Risk Prediction System</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Live Air Quality</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-transparent border-r-transparent"></div>
                  <p className="text-gray-600 mt-4">Loading live data...</p>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-8">
                  <p>❌ {error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2">
                    📍 {stations.length} monitoring stations across India
                  </div>
                  {stations.slice(0, 5).map((station) => (
                    <div key={station.station} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{station.city}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(station.current_risk_level)}`}>
                          {station.current_risk_level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">AQI: <span className="font-bold text-lg">{station.overall_aqi}</span></p>
                          <p className="text-gray-600">Source: <span className="font-medium">{station.likely_source}</span></p>
                          <p className="text-gray-600">Method: <span className="text-xs bg-blue-100 px-2 py-1 rounded">{station.source_method}</span></p>
                        </div>
                        
                        {station.predicted_aqi_next_6h && (
                          <div>
                            <p className="text-gray-600">Predicted (6h): <span className="font-medium">{station.predicted_aqi_next_6h.toFixed(1)}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {stations.length > 5 && (
                    <div className="text-center mt-4 text-blue-600">
                      <p>... and {stations.length - 5} more stations</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🗺️ India Air Quality Map</h2>
              <div className="map-container bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <p>🗺️ Interactive Map</p>
                  <p className="text-sm mt-2">Shows real-time air quality across India</p>
                  <p className="text-xs mt-1">Color-coded by risk level</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📈 Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-green-800 font-medium">Good Air Quality</span>
                  <span className="text-green-600 text-sm">
                    {stations.filter(s => s.current_risk_level === 'good').length} stations
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span className="text-yellow-800 font-medium">Moderate Risk</span>
                  <span className="text-yellow-600 text-sm">
                    {stations.filter(s => s.current_risk_level === 'moderate').length} stations
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span className="text-red-800 font-medium">Poor Air Quality</span>
                  <span className="text-red-600 text-sm">
                    {stations.filter(s => ['poor', 'very_poor', 'severe'].includes(s.current_risk_level)).length} stations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white shadow-lg mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>🌍 EcoNova Sentinel Backend Status: 
              <span className="text-green-600 font-medium">● Connected</span>
            </p>
            <p className="text-sm mt-2">
              Real-time data • ML predictions • Municipal alerts • Eco credits
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;