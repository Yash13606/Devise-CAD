@echo off
echo Starting Devise-CAD Environment...
echo Using concurrently to run all 4 microservices in this single terminal!

npx concurrently -k -p "[{name}]" -n "FRONTEND,MCP,API,AGENT" -c "cyan,magenta,green,yellow" "cd frontend && npm run dev" "cd mcp && npx tsx server.ts" "python -m uvicorn api.index:app --reload --port 8000" "cd devise-agent\devise-eye && python main.py"
