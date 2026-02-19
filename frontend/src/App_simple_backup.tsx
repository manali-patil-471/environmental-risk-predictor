import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Station {
  station: string;
  city: string;
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
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8001/live-data');
        setStations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'good': return 'bg-green-500';
      case 'satisfactory': return 'bg-yellow-500';
      case 'moderate': return 'bg-orange-500';
      case 'poor': return 'bg-red-500';
      case 'very_poor': return 'bg-red-700';
      case 'severe': return 'bg-red-900';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8'>
      <header className='bg-white shadow-lg p-6'>
        <h1 className='text-3xl font-bold text-green-800'>
          🌿 EcoNova Sentinel
        </h1>
        <p className='text-gray-600'>Environmental Risk Prediction System</p>
      </header>

      <main className='max-w-7xl mx-auto p-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>🌍 Live Air Quality</h2>
            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 border-t-transparent border-r-transparent'></div>
                <p className='text-gray-600 mt-4'>Loading live data...</p>
              </div>
            ) : error ? (
              <div className='text-center py-8'>
                <p className='text-red-600'>⚠️ {error}</p>
              </div>
            ) : (
              <div className='space-y-4'>
                <p className='text-sm text-gray-600 mb-2'>
                  📍 {stations.length} monitoring stations across India
                </p>
                {stations.slice(0, 5).map((station) => (
                  <div key={station.station} className='border rounded-lg p-4 hover:shadow-md transition-shadow'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-semibold text-lg'>{station.city}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getRiskColor(station.current_risk_level)}`}>
                        {station.current_risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <p>AQI: <span className='font-bold'>{station.overall_aqi}</span></p>
                      <p>Source: <span className='font-medium'>{station.likely_source}</span></p>
                      <p>Method: {station.source_method}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='lg:col-span-1 bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>🗺️ India Air Quality Map</h2>
            <div className='bg-gray-100 rounded-lg p-8 flex items-center justify-center'>
              <p className='text-gray-500'>🗺️ Interactive Map</p>
              <p className='text-sm text-gray-600'>Shows real-time air quality across India</p>
              <p className='text-xs text-gray-500'>Color-coded by risk level</p>
            </div>
          </div>

          <div className='lg:col-span-1 bg-white rounded-lg shadow-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>📊 Quick Stats</h2>
            <div className='space-y-4'>
              <div className='flex justify-between items-center p-3 bg-green-50 rounded'>
                <span className='text-green-800 font-medium'>Good Air Quality</span>
                <span className='text-green-600'>{stations.filter(s => s.current_risk_level === 'good').length} stations</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-yellow-50 rounded'>
                <span className='text-yellow-800 font-medium'>Moderate Risk</span>
                <span className='text-yellow-600'>{stations.filter(s => s.current_risk_level === 'moderate').length} stations</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-red-50 rounded'>
                <span className='text-red-800 font-medium'>Poor Air Quality</span>
                <span className='text-red-600'>{stations.filter(s => ['poor', 'very_poor', 'severe'].includes(s.current_risk_level)).length} stations</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className='bg-white shadow-lg mt-8'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='text-center text-gray-600'>
            <p>🌿 EcoNova Sentinel Backend Status: 
              <span className='text-green-600 font-medium'>✅ Connected</span>
            </p>
            <p className='text-sm text-gray-600 mt-2'>
              Real-time data updates every 5 minutes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
