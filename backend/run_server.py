import uvicorn
import asyncio

# Set up event loop for Python 3.6 compatibility
if hasattr(asyncio, 'run'):
    # Python 3.7+
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="info")
else:
    # Python 3.6
    loop = asyncio.get_event_loop()
    config = uvicorn.Config("main:app", host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    loop.run_until_complete(server.serve())
