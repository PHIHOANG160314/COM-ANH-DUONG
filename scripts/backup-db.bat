@echo off
echo ========================================
echo   SUPABASE DATABASE BACKUP UTILITY
echo ========================================

set /p DB_URL="Enter Supabase DB Connection String (postgres://...): "

if "%DB_URL%"=="" goto error

echo.
echo Dumping database structure and data...
mkdir backups 2>nul
set FILENAME=backups\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%.sql
set FILENAME=%FILENAME: =0%

docker run --rm -it postgres:15 pg_dump "%DB_URL%" > "%FILENAME%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Backup successful!
    echo File: %FILENAME%
) else (
    echo.
    echo ❌ Backup failed!
)
pause
exit /b

:error
echo Error: Connection string is required.
pause
