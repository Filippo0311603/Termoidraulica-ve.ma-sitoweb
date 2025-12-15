@echo off
echo Avvio del Server Backend (Node.js)...
start "Backend Server (Port 4242)" cmd /k "node server.cjs"

echo Avvio del Frontend (Vite)...
start "Frontend (Vite)" cmd /k "npm run dev"

echo Tutto avviato! Controlla le due finestre aperte.
