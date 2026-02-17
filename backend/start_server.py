import uvicorn
from main import app

# Use simple uvicorn call for Python 3.6
uvicorn.run(app, host="0.0.0.0", port=8001, debug=False)
