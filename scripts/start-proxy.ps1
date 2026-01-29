# =============================================
# Quick Proxy Starter
# =============================================
# Chạy script này để khởi động proxy nhanh

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$scriptDir\AntigravityProxy.psm1" -Force

Start-AntigravityProxy
