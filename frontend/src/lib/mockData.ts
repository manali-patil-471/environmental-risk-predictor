export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temp: number;
  humidity: number;
  wind: number;
  status: 'online' | 'offline' | 'maintenance';
  lastUpdated: string;
  sources: string[];
}

export interface AQITrend {
  time: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
}

export interface Alert {
  id: string;
  city: string;
  state: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface EcoCredit {
  userId: string;
  name: string;
  credits: number;
  rank: number;
  avatar: string;
  actions: number;
  badge: string;
}

export const AQI_CATEGORIES = {
  good: { label: 'Good', min: 0, max: 50, class: 'aqi-good', color: '#22c55e' },
  moderate: { label: 'Moderate', min: 51, max: 100, class: 'aqi-moderate', color: '#eab308' },
  unhealthySG: { label: 'Unhealthy for SG', min: 101, max: 150, class: 'aqi-unhealthy-sg', color: '#f97316' },
  unhealthy: { label: 'Unhealthy', min: 151, max: 200, class: 'aqi-unhealthy', color: '#ef4444' },
  veryUnhealthy: { label: 'Very Unhealthy', min: 201, max: 300, class: 'aqi-very-unhealthy', color: '#a855f7' },
  hazardous: { label: 'Hazardous', min: 301, max: 500, class: 'aqi-hazardous', color: '#7f1d1d' },
} as const;

export function getAQICategory(aqi: number) {
  if (aqi <= 50) return AQI_CATEGORIES.good;
  if (aqi <= 100) return AQI_CATEGORIES.moderate;
  if (aqi <= 150) return AQI_CATEGORIES.unhealthySG;
  if (aqi <= 200) return AQI_CATEGORIES.unhealthy;
  if (aqi <= 300) return AQI_CATEGORIES.veryUnhealthy;
  return AQI_CATEGORIES.hazardous;
}

export const INDIA_STATIONS: Station[] = [
  {
    id: 'del-001', name: 'ITO Station', city: 'New Delhi', state: 'Delhi',
    lat: 28.6317, lng: 77.2410, aqi: 287, pm25: 142, pm10: 198, no2: 68, so2: 22, co: 3.2, o3: 45,
    temp: 24, humidity: 62, wind: 8.2, status: 'online', lastUpdated: '2 min ago',
    sources: ['traffic', 'construction', 'industry'],
  },
  {
    id: 'mum-001', name: 'Bandra Station', city: 'Mumbai', state: 'Maharashtra',
    lat: 19.0596, lng: 72.8295, aqi: 98, pm25: 42, pm10: 78, no2: 38, so2: 12, co: 1.1, o3: 32,
    temp: 30, humidity: 85, wind: 14.5, status: 'online', lastUpdated: '1 min ago',
    sources: ['traffic', 'construction'],
  },
  {
    id: 'blr-001', name: 'Hebbal Station', city: 'Bengaluru', state: 'Karnataka',
    lat: 13.0439, lng: 77.5971, aqi: 56, pm25: 22, pm10: 45, no2: 28, so2: 8, co: 0.8, o3: 28,
    temp: 27, humidity: 68, wind: 11.2, status: 'online', lastUpdated: '3 min ago',
    sources: ['traffic'],
  },
  {
    id: 'kol-001', name: 'Jadavpur Station', city: 'Kolkata', state: 'West Bengal',
    lat: 22.4997, lng: 88.3715, aqi: 175, pm25: 88, pm10: 134, no2: 52, so2: 18, co: 2.4, o3: 38,
    temp: 32, humidity: 78, wind: 6.8, status: 'online', lastUpdated: '4 min ago',
    sources: ['industry', 'traffic', 'construction'],
  },
  {
    id: 'che-001', name: 'Perungudi Station', city: 'Chennai', state: 'Tamil Nadu',
    lat: 12.9716, lng: 80.2446, aqi: 72, pm25: 28, pm10: 56, no2: 32, so2: 10, co: 1.0, o3: 25,
    temp: 34, humidity: 80, wind: 18.4, status: 'online', lastUpdated: '2 min ago',
    sources: ['traffic'],
  },
  {
    id: 'hyd-001', name: 'ICRISAT Station', city: 'Hyderabad', state: 'Telangana',
    lat: 17.3850, lng: 78.4867, aqi: 112, pm25: 54, pm10: 96, no2: 44, so2: 14, co: 1.6, o3: 36,
    temp: 28, humidity: 55, wind: 9.8, status: 'online', lastUpdated: '1 min ago',
    sources: ['construction', 'traffic'],
  },
  {
    id: 'pun-001', name: 'Lohegaon Station', city: 'Pune', state: 'Maharashtra',
    lat: 18.5204, lng: 73.8567, aqi: 88, pm25: 38, pm10: 68, no2: 30, so2: 9, co: 0.9, o3: 30,
    temp: 26, humidity: 72, wind: 12.6, status: 'online', lastUpdated: '5 min ago',
    sources: ['traffic', 'industry'],
  },
  {
    id: 'ahm-001', name: 'Maninagar Station', city: 'Ahmedabad', state: 'Gujarat',
    lat: 23.0225, lng: 72.5714, aqi: 163, pm25: 80, pm10: 128, no2: 56, so2: 20, co: 2.1, o3: 42,
    temp: 33, humidity: 45, wind: 7.4, status: 'online', lastUpdated: '3 min ago',
    sources: ['industry', 'construction'],
  },
  {
    id: 'luc-001', name: 'Gomti Nagar Station', city: 'Lucknow', state: 'Uttar Pradesh',
    lat: 26.8467, lng: 80.9462, aqi: 234, pm25: 118, pm10: 178, no2: 64, so2: 24, co: 3.8, o3: 48,
    temp: 22, humidity: 68, wind: 5.2, status: 'online', lastUpdated: '2 min ago',
    sources: ['traffic', 'construction', 'industry'],
  },
  {
    id: 'jai-001', name: 'Jhotwara Station', city: 'Jaipur', state: 'Rajasthan',
    lat: 26.9124, lng: 75.7873, aqi: 142, pm25: 68, pm10: 112, no2: 48, so2: 16, co: 1.8, o3: 40,
    temp: 30, humidity: 38, wind: 10.2, status: 'online', lastUpdated: '4 min ago',
    sources: ['construction', 'traffic'],
  },
  {
    id: 'pat-001', name: 'IGIMS Station', city: 'Patna', state: 'Bihar',
    lat: 25.5941, lng: 85.1376, aqi: 312, pm25: 158, pm10: 224, no2: 72, so2: 28, co: 4.6, o3: 52,
    temp: 25, humidity: 74, wind: 4.8, status: 'online', lastUpdated: '1 min ago',
    sources: ['industry', 'traffic', 'construction'],
  },
  {
    id: 'ind-001', name: 'Palasia Station', city: 'Indore', state: 'Madhya Pradesh',
    lat: 22.7196, lng: 75.8577, aqi: 126, pm25: 60, pm10: 102, no2: 46, so2: 16, co: 1.5, o3: 38,
    temp: 29, humidity: 52, wind: 8.6, status: 'maintenance', lastUpdated: '15 min ago',
    sources: ['traffic', 'industry'],
  },
];

export const HOURLY_TRENDS: AQITrend[] = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const baseAqi = 140;
  const variation = Math.sin((hour - 8) * Math.PI / 12) * 60;
  const noise = Math.random() * 20 - 10;
  const aqi = Math.max(30, Math.round(baseAqi + variation + noise));
  return {
    time: `${String(hour).padStart(2, '0')}:00`,
    aqi,
    pm25: Math.round(aqi * 0.48),
    pm10: Math.round(aqi * 0.72),
    no2: Math.round(aqi * 0.22),
  };
});

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1', city: 'Patna', state: 'Bihar', level: 'critical',
    message: 'AQI has exceeded hazardous levels (312). Outdoor activities strongly discouraged.',
    timestamp: '2025-02-18T08:42:00', read: false,
  },
  {
    id: 'a2', city: 'New Delhi', state: 'Delhi', level: 'warning',
    message: 'PM2.5 concentrations rising rapidly. Schools advised to limit outdoor activities.',
    timestamp: '2025-02-18T07:30:00', read: false,
  },
  {
    id: 'a3', city: 'Lucknow', state: 'Uttar Pradesh', level: 'warning',
    message: 'AQI at 234 — Very Unhealthy. Construction activities suspended until further notice.',
    timestamp: '2025-02-18T06:15:00', read: true,
  },
  {
    id: 'a4', city: 'Kolkata', state: 'West Bengal', level: 'warning',
    message: 'Industrial emissions spiking. Air quality monitoring intensified.',
    timestamp: '2025-02-18T05:00:00', read: true,
  },
  {
    id: 'a5', city: 'Bengaluru', state: 'Karnataka', level: 'info',
    message: 'Air quality improving following overnight rains. AQI dropped to Good levels.',
    timestamp: '2025-02-18T04:00:00', read: true,
  },
];

export const LEADERBOARD: EcoCredit[] = [
  { userId: 'u1', name: 'Priya Sharma', credits: 2840, rank: 1, avatar: 'PS', actions: 142, badge: '🌱 Eco Champion' },
  { userId: 'u2', name: 'Rahul Verma', credits: 2650, rank: 2, avatar: 'RV', actions: 128, badge: '🍃 Green Guardian' },
  { userId: 'u3', name: 'Ananya Singh', credits: 2340, rank: 3, avatar: 'AS', actions: 114, badge: '🌿 Eco Warrior' },
  { userId: 'u4', name: 'Kiran Patel', credits: 1980, rank: 4, avatar: 'KP', actions: 98, badge: '🌲 Nature Keeper' },
  { userId: 'u5', name: 'Meera Nair', credits: 1760, rank: 5, avatar: 'MN', actions: 86, badge: '🌳 Eco Defender' },
  { userId: 'u6', name: 'Arjun Kumar', credits: 1540, rank: 6, avatar: 'AK', actions: 74, badge: '🌻 Green Seeker' },
  { userId: 'u7', name: 'Divya Reddy', credits: 1280, rank: 7, avatar: 'DR', actions: 62, badge: '🌺 Eco Beginner' },
];

export const POLLUTION_SOURCES = [
  { name: 'Traffic & Vehicles', percentage: 38, color: '#f97316', icon: '🚗' },
  { name: 'Industrial', percentage: 28, color: '#ef4444', icon: '🏭' },
  { name: 'Construction', percentage: 18, color: '#eab308', icon: '🏗️' },
  { name: 'Agriculture', percentage: 10, color: '#22c55e', icon: '🌾' },
  { name: 'Residential', percentage: 6, color: '#3b82f6', icon: '🏠' },
];
