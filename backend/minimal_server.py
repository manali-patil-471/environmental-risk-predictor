#!/usr/bin/env python
"""
Minimal Python 3.6 compatible HTTP server for live data without uvicorn/FastAPI.
"""
import json
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from data_cleaner import clean_and_pivot_aqdata
from fetcher import get_live_data
from ml_models.risk_zones_mapper import enrich_all_stations_with_risk
from ml_models.source_identifier import identify_sources_for_stations

# Global cache
DATA_CACHE = {
    'data': None,
    'timestamp': 0,
    'loading': False
}
CACHE_DURATION = 60  # 1 minute


def fetch_data_bg():
    """Background thread to fetch data periodically"""
    while True:
        if time.time() - DATA_CACHE['timestamp'] > CACHE_DURATION and not DATA_CACHE['loading']:
            DATA_CACHE['loading'] = True
            try:
                print("[*] Fetching fresh data from CPCB API...")
                raw_df = get_live_data(state="", limit=150)
                
                if raw_df is not None:
                    print("[✓] Got {} records from CPCB".format(len(raw_df)))
                    
                    # Clean data
                    cleaned_df = clean_and_pivot_aqdata(raw_df)
                    
                    if not cleaned_df.empty:
                        # Enrich with risk and sources
                        stations = cleaned_df.to_dict('records')
                        stations_with_risk = enrich_all_stations_with_risk(stations)
                        stations_with_sources = identify_sources_for_stations(stations_with_risk, use_ml=True)
                        
                        DATA_CACHE['data'] = {
                            'count': len(stations_with_sources),
                            'data': stations_with_sources,
                            'timestamp': time.time(),
                            'source': 'cpcb',
                            'status': 'success'
                        }
                        print("[✓] Data cached successfully")
            except Exception as e:
                print("[!] Error fetching data: {}".format(e))
            finally:
                DATA_CACHE['loading'] = False
        
        time.sleep(10)  # Check every 10 seconds


class LiveDataHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()
        
        if self.path == '/live-data':
            if DATA_CACHE['data']:
                response = DATA_CACHE['data'].copy()
                response['cached'] = time.time() - response['timestamp'] < CACHE_DURATION
                response['cache_age_seconds'] = time.time() - response['timestamp']
                self.wfile.write(json.dumps(response).encode())
            else:
                self.wfile.write(json.dumps({
                    'error': 'No data available',
                    'status': 'mock'
                }).encode())
        elif self.path == '/':
            self.wfile.write(json.dumps({
                'status': 'EcoNova Sentinel Backend is Live',
                'timestamp': time.time()
            }).encode())
        else:
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Suppress default logging


if __name__ == '__main__':
    # Start background fetcher
    bg_thread = threading.Thread(target=fetch_data_bg)
    bg_thread.daemon = True
    bg_thread.start()
    
    # Initial fetch
    print("\n🚀 EcoNova Minimal Server (Python 3.6 Compatible)")
    print("📡 Starting on http://127.0.0.1:8000")
    print("[*] Fetching initial data...")
    
    # Kick off first data fetch
    fetch_data_bg()
    
    # Start HTTP server
    server = HTTPServer(('127.0.0.1', 8000), LiveDataHandler)
    print("[✓] Server ready! Press Ctrl+C to stop\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Server stopped")
        server.server_close()
