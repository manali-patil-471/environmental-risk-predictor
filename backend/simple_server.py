import asyncio
import uvicorn
from main import app

# Python 3.6 compatible server startup
def run_server():
    loop = asyncio.get_event_loop()
    
    # Simple config for Python 3.6
    config = uvicorn.Config(app, host="0.0.0.0", port=8001, log_level="info")
    server = uvicorn.Server(config)
    
    # Run server
    loop.create_task(server.serve())
    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        loop.close()

if __name__ == "__main__":
    print("🚀 Starting EcoNova Sentinel Backend...")
    print("📡 Server will run on: http://localhost:8001")
    print("🌍 All 7 features implemented:")
    print("   ✅ Predictable Risk Engine")
    print("   ✅ Personalized Health Dashboard") 
    print("   ✅ Municipal Alert System")
    print("   ✅ Eco-Credits System")
    print("   ✅ Source Identification")
    print("   ✅ Notification System")
    print("   ✅ Real-time Data")
    print("\n🎯 Ready for testing!")
    run_server()
