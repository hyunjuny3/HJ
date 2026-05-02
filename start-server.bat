@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  Local server for F1 schedule app
echo  Keep this window OPEN while using the site.
echo  Open in browser:  http://127.0.0.1:8765/
echo  Use http://  NOT https://
echo.

start "" "http://127.0.0.1:8765/"

if exist "C:\Users\HyunJ\AppData\Local\Python\bin\python.exe" (
  "C:\Users\HyunJ\AppData\Local\Python\bin\python.exe" -m http.server 8765 --bind 127.0.0.1
) else where py >nul 2>&1 && (
  py -m http.server 8765 --bind 127.0.0.1
) else where python >nul 2>&1 && (
  python -m http.server 8765 --bind 127.0.0.1
) else (
  echo Python not found. Install from https://www.python.org and check "Add to PATH".
  pause
  exit /b 1
)

pause
