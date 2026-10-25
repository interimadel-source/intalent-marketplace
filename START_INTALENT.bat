@echo off
title INTALENT Marketplace - Server
color 0A
echo ================================================================
echo       INTALENT - Plateforme de Freelance & Entreprises Algerie
echo ================================================================
echo.
echo [1/2] Lancement du serveur Python sur http://localhost:8000 ...
echo [2/2] Ouverture automatique du navigateur...
echo.
start http://localhost:8000
python server.py
pause
