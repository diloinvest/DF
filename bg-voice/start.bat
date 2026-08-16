@echo off
REM Double-click this file to start everything.
REM It bypasses the PowerShell script policy that blocks .ps1 files by default.
REM Text here is ASCII on purpose: .bat files are read in the OEM codepage,
REM so Cyrillic would come out garbled. The PowerShell script speaks Bulgarian.

setlocal
cd /d "%~dp0"

if "%ANTHROPIC_API_KEY%"=="" (
    echo.
    echo No Claude API key found ^(ANTHROPIC_API_KEY^).
    echo Get one at https://console.anthropic.com/settings/keys
    echo.
    set /p "ANTHROPIC_API_KEY=Paste the key here and press Enter: "
)

if "%ANTHROPIC_API_KEY%"=="" (
    echo No key entered. Stopping.
    pause
    exit /b 1
)

REM Remember it for next time.
setx ANTHROPIC_API_KEY "%ANTHROPIC_API_KEY%" >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*

echo.
pause
