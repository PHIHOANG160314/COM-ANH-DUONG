' Antigravity Claude Proxy - Hidden Startup Script
' This script starts the proxy without showing a command window

Set WshShell = CreateObject("WScript.Shell")

' Change to the CAD directory and start the proxy
WshShell.CurrentDirectory = "d:\COM ANH DUONG\CAD"

' Run npx antigravity-claude-proxy in hidden mode with round-robin strategy
WshShell.Run "cmd /c npx antigravity-claude-proxy --strategy=round-robin", 0, False

' Optional: Log startup
' WshShell.Run "cmd /c echo [%date% %time%] Proxy started >> d:\COM ANH DUONG\CAD\logs\startup.log", 0, False
