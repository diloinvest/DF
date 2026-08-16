<#
.SYNOPSIS
    Вдига гласовия сървър и публичен HTTPS адрес за телефона.

.EXAMPLE
    .\start.ps1
    .\start.ps1 -Model medium      # по-бърз старт, малко по-слаба точност
    .\start.ps1 -NoTunnel          # само локално, без Cloudflare
#>
param(
    [string]$Model = "large-v3",
    [int]$Port = 8000,
    [switch]$NoTunnel
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Say($text, $color = "White") { Write-Host $text -ForegroundColor $color }

# --- Проверки -------------------------------------------------------------

if (-not $env:ANTHROPIC_API_KEY) {
    Say "Липсва ANTHROPIC_API_KEY." Red
    Say 'Задай го така, после отвори нов терминал:' Yellow
    Say '    setx ANTHROPIC_API_KEY "sk-ant-..."' Yellow
    exit 1
}

if (-not (Test-Path ".venv")) {
    Say "Създавам виртуална среда и инсталирам зависимости (еднократно)..." Cyan
    python -m venv .venv
    & .\.venv\Scripts\python.exe -m pip install --quiet --upgrade pip
    & .\.venv\Scripts\python.exe -m pip install --quiet -r requirements.txt
    Say "Готово." Green
}

$python = ".\.venv\Scripts\python.exe"
$env:WHISPER_MODEL = $Model
$env:PORT = "$Port"

$useTunnel = -not $NoTunnel
if ($useTunnel -and -not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Say "cloudflared не е намерен — продължавам само локално." Yellow
    Say "За достъп от телефона го инсталирай с:  winget install --id Cloudflare.cloudflared" Yellow
    $useTunnel = $false
}

# --- Стартиране -----------------------------------------------------------

$server = $null
$tunnel = $null

try {
    Say "`nСтартирам сървъра (модел: $Model)..." Cyan
    $server = Start-Process $python -ArgumentList "server.py" -NoNewWindow -PassThru

    # Изчакваме сървъра да отговори. Моделът се тегли на заден план.
    $ready = $false
    foreach ($i in 1..60) {
        Start-Sleep -Seconds 1
        if ($server.HasExited) { Say "Сървърът спря при стартиране." Red; exit 1 }
        try {
            Invoke-RestMethod "http://localhost:$Port/api/health" -TimeoutSec 2 | Out-Null
            $ready = $true
            break
        } catch { }
    }
    if (-not $ready) { Say "Сървърът не отговори навреме." Red; exit 1 }
    Say "Сървърът е вдигнат: http://localhost:$Port" Green

    if ($useTunnel) {
        Say "Отварям публичен HTTPS адрес..." Cyan
        $log = Join-Path $env:TEMP "bg-voice-tunnel.log"
        Remove-Item $log, "$log.out" -ErrorAction SilentlyContinue
        $tunnel = Start-Process cloudflared `
            -ArgumentList "tunnel", "--url", "http://localhost:$Port" `
            -RedirectStandardError $log -RedirectStandardOutput "$log.out" `
            -NoNewWindow -PassThru

        $url = $null
        foreach ($i in 1..40) {
            Start-Sleep -Seconds 1
            if (Test-Path $log) {
                $m = Select-String -Path $log -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" `
                    -AllMatches -ErrorAction SilentlyContinue
                if ($m) { $url = $m.Matches[0].Value; break }
            }
        }

        if ($url) {
            Say "`n╔══════════════════════════════════════════════════════════╗" Green
            Say  "  Отвори този адрес в Safari на телефона:" Green
            Say  "`n      $url`n" Green
            Say  "╚══════════════════════════════════════════════════════════╝" Green
        } else {
            Say "Не успях да прочета адреса на тунела. Виж: $log" Yellow
        }
    }

    Say "`nПървото пускане тегли модела — говори чак когато в лога пише 'Whisper е готов.'" Yellow
    Say "Спиране: Ctrl+C`n" Yellow

    Wait-Process -Id $server.Id
}
finally {
    foreach ($p in @($tunnel, $server)) {
        if ($p -and -not $p.HasExited) {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Say "Спряно." Cyan
}
