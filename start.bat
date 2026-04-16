@echo off
echo Starting Devise-CAD Environment...
echo Running: Frontend, MCP Gateway, Desktop Agent

npx concurrently -k -p "[{name}]" -n "FRONTEND,MCP,AGENT" -c "cyan,magenta,yellow" "cd frontend && npm run dev" "cd mcp-gateway && npx tsx server.ts" "cd devise-agent\devise-eye && python main.py"
