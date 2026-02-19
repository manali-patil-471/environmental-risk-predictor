import axios from 'axios';
import { INDIA_STATIONS, HOURLY_TRENDS, MOCK_ALERTS } from './mockData';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercept and fallback to mock data if API unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API unavailable, using mock data:', error.message);
    return Promise.reject(error);
  }
);

export async function fetchLiveData() {
  try {
    const { data } = await api.get('/live-data');
    return data;
  } catch {
    // Return mock data as fallback
    return {
      stations: INDIA_STATIONS,
      timestamp: new Date().toISOString(),
      status: 'mock',
    };
  }
}

export async function fetchPredictions(stationId?: string) {
  try {
    const { data } = await api.get('/predict', { params: { station_id: stationId } });
    return data;
  } catch {
    return {
      predictions: HOURLY_TRENDS.slice(12).map((t, i) => ({
        ...t,
        time: `+${(i + 1) * 2}h`,
        confidence: 0.85 - i * 0.05,
      })),
      status: 'mock',
    };
  }
}

export async function fetchFuturePredictions(hoursAhead: number = 24) {
  try {
    // The backend /predict endpoint gives predictions for next 6h
    // We simulate 24-48h predictions by extrapolating
    const { data } = await api.get('/predict');
    if (data && data.data) {
      // Generate predictions for hours 24, 36, 48
      const futurePredictions = [24, 48].map((hour) => {
        const baseAqi = data.data[0]?.predicted_aqi_next_6h || 150;
        // Add some variation based on hour to simulate day/night cycles
        const variation = Math.sin((hour - 6) * Math.PI / 24) * 30;
        const randomFactor = Math.random() * 20 - 10;
        const predictedAqi = Math.max(30, Math.min(400, Math.round(baseAqi + variation + randomFactor)));
        
        return {
          hour: hour,
          time: `+${hour}h`,
          predicted_aqi: predictedAqi,
          confidence: hour === 24 ? 0.75 : 0.65,
          timestamp: new Date(Date.now() + hour * 60 * 60 * 1000).toISOString(),
        };
      });
      return {
        predictions: futurePredictions,
        status: 'success',
      };
    }
    throw new Error('No data');
  } catch {
    // Mock data for 24-48h predictions
    const now = new Date();
    return {
      predictions: [
        {
          hour: 24,
          time: '+24h',
          predicted_aqi: Math.floor(Math.random() * 100) + 120,
          confidence: 0.75,
          timestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          hour: 48,
          time: '+48h',
          predicted_aqi: Math.floor(Math.random() * 100) + 100,
          confidence: 0.65,
          timestamp: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        },
      ],
      status: 'mock',
    };
  }
}

export async function fetchHealthAdvice(params: {
  aqi: number;
  age_group?: string;
  conditions?: string[];
}) {
  try {
    const { data } = await api.post('/health-advice', params);
    return data;
  } catch {
    const { aqi } = params;
    return {
      advice: aqi > 200
        ? 'Stay indoors with air purifier. Avoid all outdoor activities. Wear N95 masks if going outside.'
        : aqi > 150
        ? 'Limit prolonged outdoor exertion. Sensitive groups should avoid outdoor activities.'
        : aqi > 100
        ? 'Unusually sensitive people should consider reducing prolonged outdoor exertion.'
        : 'Air quality is acceptable. Enjoy your outdoor activities.',
      risk_level: aqi > 200 ? 'Very High' : aqi > 150 ? 'High' : aqi > 100 ? 'Moderate' : 'Low',
      status: 'mock',
    };
  }
}

export async function fetchMunicipalAlerts(city?: string) {
  try {
    const { data } = await api.post('/municipal-alerts', { city });
    return data;
  } catch {
    return {
      alerts: MOCK_ALERTS.filter(a => !city || a.city === city),
      status: 'mock',
    };
  }
}

export async function fetchEcoCredits(userId?: string) {
  try {
    const { data } = await api.post('/eco-credits', { user_id: userId });
    return data;
  } catch {
    return {
      user_credits: 1420,
      rank: 12,
      total_actions: 68,
      status: 'mock',
    };
  }
}

export async function fetchHistoricalAQI(params: {
  station?: string;
  city?: string;
  days?: number;
}) {
  try {
    const { data } = await api.get('/historical-aqi', { params });
    return data;
  } catch {
    // Return mock historical data as fallback
    const { days = 7 } = params;
    const mockData = [];
    const now = new Date();
    for (let i = days * 24; i > 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        mockData.push({
        timestamp: date.toISOString(),
        overall_aqi: Math.floor(Math.random() * 150) + 50,
        "PM2.5": Math.floor(Math.random() * 80) + 20,
        "PM10": Math.floor(Math.random() * 100) + 30,
      });
    }
    return {
      count: mockData.length,
      data: mockData,
      days_requested: days,
      status: 'mock',
    };
  }
}

export async function fetchAQITrends(city?: string, period: string = '7d') {
  try {
    const { data } = await api.get('/aqi-trends', { params: { city, period } });
    return data;
  } catch {
    // Return mock trends data
    return {
      period,
      cities: [
        { city: 'Delhi', avg_aqi: 245, min_aqi: 180, max_aqi: 320, std_aqi: 42 },
        { city: 'Mumbai', avg_aqi: 120, min_aqi: 80, max_aqi: 165, std_aqi: 25 },
        { city: 'Bengaluru', avg_aqi: 75, min_aqi: 45, max_aqi: 110, std_aqi: 18 },
        { city: 'Kolkata', avg_aqi: 165, min_aqi: 120, max_aqi: 210, std_aqi: 28 },
        { city: 'Chennai', avg_aqi: 85, min_aqi: 55, max_aqi: 125, std_aqi: 20 },
        { city: 'Hyderabad', avg_aqi: 110, min_aqi: 75, max_aqi: 150, std_aqi: 22 },
        { city: 'Pune', avg_aqi: 95, min_aqi: 60, max_aqi: 135, std_aqi: 21 },
        { city: 'Ahmedabad', avg_aqi: 145, min_aqi: 100, max_aqi: 190, std_aqi: 26 },
      ],
      status: 'mock',
    };
  }
}

export default api;
