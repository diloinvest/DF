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
# В PowerShell 7.4+ ненулев exit код на външна команда хвърля изключение.
# Изключваме го — проверяваме кодовете сами, за да даваме смислени съобщения.
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}

Set-Location $PSScriptRoot
$OutputEncoding = [System.Text.Encoding]::UTF8

function Say($text, $color = "White") { Write-Host $text -ForegroundColor $color }

# --- Намиране на Python ---------------------------------------------------

function Resolve-Python {
    <#
      На Windows 11 `python` често е заместител от Microsoft Store, който само
      отваря магазина вместо да пусне Python. Затова опитваме `py -3` първо и
      приемаме само нещо, което наистина връща версия 3.10 или по-нова.
    #>
    $tries = @(
        @{ Exe = "py";      Prefix = @("-3") },
        @{ Exe = "python";  Prefix = @() },
        @{ Exe = "python3"; Prefix = @() }
    )

    foreach ($try in $tries) {
        if (-not (Get-Command $try.Exe -ErrorAction SilentlyContinue)) { continue }
        try {
            if ($try.Prefix.Count -gt 0) {
                $out = & $try.Exe $try.Prefix --version 2>&1
            } else {
                $out = & $try.Exe --version 2>&1
            }
        } catch { continue }

        if ($LASTEXITCODE -ne 0) { continue }
        if ("$out" -notmatch "Python 3\.(\d+)") { continue }
        if ([int]$Matches[1] -lt 10) {
            Say "Намерен е $out, но трябва Python 3.10 или по-нов." Yellow
            continue
        }
        return @{ Exe = $try.Exe; Prefix = $try.Prefix; Version = "$out".Trim() }
    }
    return $null
}

function Invoke-Py {
    param([hashtable]$Py, [string[]]$Arguments)
    $argv = @()
    if ($Py.Prefix.Count -gt 0) { $argv += $Py.Prefix }
    $argv += $Arguments
    & $Py.Exe $argv
}

# --- Проверки -------------------------------------------------------------

if (-not $env:ANTHROPIC_API_KEY) {
    Say "Липсва ANTHROPIC_API_KEY." Red
    Say 'Задай го така, после отвори НОВ терминал (setx не важи за текущия):' Yellow
    Say '    setx ANTHROPIC_API_KEY "sk-ant-..."' Yellow
    exit 1
}

if (-not (Test-Path ".venv")) {
    $py = Resolve-Python
    if (-not $py) {
        Say "Не намирам Python 3.10 или по-нов." Red
        Say "Инсталирай го с:" Yellow
        Say "    winget install --id Python.Python.3.12" Yellow
        Say "После затвори и отвори терминала наново." Yellow
        exit 1
    }
    Say "Използвам $($py.Version)" DarkGray
    Say "Създавам виртуална среда и инсталирам зависимости (еднократно)..." Cyan

    Invoke-Py $py @("-m", "venv", ".venv")
    if ($LASTEXITCODE -ne 0) { Say "Създаването на виртуалната среда се провали." Red; exit 1 }

    & .\.venv\Scripts\python.exe -m pip install --quiet --upgrade pip
    & .\.venv\Scripts\python.exe -m pip install --quiet -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Say "Инсталацията на зависимостите се провали." Red
        Say "Изтрий папката .venv и опитай пак." Yellow
        exit 1
    }
    Say "Готово." Green
}

$python = ".\.venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    Say "Средата .venv е повредена. Изтрий папката .venv и пусни скрипта пак." Red
    exit 1
}

$env:WHISPER_MODEL = $Model
$env:PORT = "$Port"

$useTunnel = -not $NoTunnel
if ($useTunnel -and -not (Get-Command cloudflared -ErrorAction SilentlyContinue)) {
    Say "cloudflared не е намерен — продължавам само локално." Yellow
    Say "За достъп от телефона го инсталирай с:" Yellow
    Say "    winget install --id Cloudflare.cloudflared" Yellow
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
            if (-not (Test-Path $log)) { continue }
            $hit = Select-String -Path $log -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" `
                -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($hit) { $url = $hit.Matches[0].Value; break }
        }

        if ($url) {
            Say "`n===========================================================" Green
            Say "  Отвори този адрес в Safari на телефона:" Green
            Say "`n      $url`n" Green
            Say "===========================================================" Green
        } else {
            Say "Не успях да прочета адреса на тунела. Виж лога: $log" Yellow
        }
    }

    Say "`nПървото пускане тегли модела." Yellow
    Say "Изчакай реда 'Whisper е готов.' преди да говориш." Yellow
    Say "Спиране: Ctrl+C`n" Yellow

    Wait-Process -Id $server.Id
}
finally {
    foreach ($proc in @($tunnel, $server)) {
        if ($proc -and -not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Say "Спряно." Cyan
}
