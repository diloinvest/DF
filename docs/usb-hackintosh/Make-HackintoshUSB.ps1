<#
.SYNOPSIS
    Прави bootable Hackintosh флашка с macOS — от нулата, с една команда.

.DESCRIPTION
    Един файл, без зависимости. Стартираш го на Windows като администратор и
    той върши всичко:

      1. Сваля инсталатора на macOS ДИРЕКТНО от сървърите на Apple
         (през gibMacOS на corpnewt — официалният каталог на Apple, не пиратски
         образ). Или ползва твой готов .raw файл, ако му подадеш -RawImage.
      2. Форматира флашката правилно (GPT + FAT32).
      3. Слага инсталатора в com.apple.recovery.boot.
      4. Копира EFI папката, генерирана от OpenCore Legacy Patcher.
      5. Проверява резултата и ти казва какво остава.

    ⚠️ ВАЖНО: скриптът ИЗТРИВА избраната флашка. Не го пускай ОТ флашката,
    която подготвяш — сложи го на диска C: и го пусни оттам.

.PARAMETER DiskNumber
    Номерът на USB диска (виж го с `Get-Disk` или пусни скрипта без параметри —
    ще ти покаже списъка и ще спре). Задължителен за същинската работа.

.PARAMETER EfiPath
    Път до EFI папката, генерирана от OpenCore Legacy Patcher (тази, която
    съдържа BOOT и OC). Ако не я подадеш, флашката се прави без нея и после
    просто копираш папката ръчно в корена ѝ.

.PARAMETER MacOSVersion
    Голямата версия на macOS за сваляне. По подразбиране 26 (Tahoe) —
    последната с поддръжка на Intel.

.PARAMETER RawImage
    Път до готов .raw / .img образ. Ако го подадеш, скриптът НЕ сваля нищо от
    Apple, а записва образа суров върху флашката (както в клипа с balenaEtcher)
    и после само подрежда EFI дяла.

.PARAMETER WorkDir
    Работна папка за сваляния. По подразбиране: <Desktop>\HackintoshUSB

.EXAMPLE
    # Показва USB дисковете и спира — винаги започвай с това
    .\Make-HackintoshUSB.ps1

.EXAMPLE
    # Пълна автоматична подготовка
    .\Make-HackintoshUSB.ps1 -DiskNumber 2 -EfiPath "$HOME\Desktop\EFI"

.EXAMPLE
    # С готов .raw образ вместо сваляне от Apple
    .\Make-HackintoshUSB.ps1 -DiskNumber 2 -RawImage D:\Tahoe.raw -EfiPath "$HOME\Desktop\EFI"

.NOTES
    Ръководството стъпка по стъпка е в README.md до този файл.
    Правно: macOS EULA на Apple позволява инсталация само на хардуер на Apple.
    Ползвай на своя отговорност, на собствена машина.
#>

[CmdletBinding()]
param(
    [int]    $DiskNumber = -1,
    [string] $EfiPath,
    [string] $MacOSVersion = '26',
    [string] $RawImage,
    [string] $WorkDir = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'HackintoshUSB')
)

$ErrorActionPreference = 'Stop'
$GibUrl = 'https://github.com/corpnewt/gibMacOS/archive/refs/heads/master.zip'

# ---------------------------------------------------------------- помощници --

function Say  { param($m) Write-Host $m -ForegroundColor Cyan }
function Ok   { param($m) Write-Host "  ✓ $m" -ForegroundColor Green }
function Warn { param($m) Write-Host "  ! $m" -ForegroundColor Yellow }
function Die  { param($m) Write-Host "`n  ✗ $m`n" -ForegroundColor Red; exit 1 }

function Step { param([int]$n, [string]$t) Write-Host "`n[$n/6] $t" -ForegroundColor White -BackgroundColor DarkBlue }

function Assert-Admin {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $pr = New-Object Security.Principal.WindowsPrincipal($id)
    if (-not $pr.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Die "Пусни PowerShell като администратор (десен бутон → Run as administrator) и опитай пак."
    }
}

function Show-UsbDisks {
    $disks = Get-Disk | Where-Object { $_.BusType -eq 'USB' }
    if (-not $disks) {
        Warn "Няма открита USB флашка. Включи я и пусни скрипта отново."
        return $null
    }
    Write-Host ""
    foreach ($d in $disks) {
        $gb = [math]::Round($d.Size / 1GB, 1)
        Write-Host ("  Disk {0}  —  {1}  —  {2} GB  —  {3}" -f `
            $d.Number, $d.FriendlyName, $gb, $d.PartitionStyle)
    }
    return $disks
}

function Assert-SafeTarget {
    param([int]$Number)

    $disk = Get-Disk -Number $Number -ErrorAction SilentlyContinue
    if (-not $disk)                 { Die "Няма диск с номер $Number." }
    if ($disk.BusType -ne 'USB')    { Die "Disk $Number не е USB ($($disk.BusType)). Отказвам да пипна вътрешен диск." }
    if ($disk.IsBoot -or $disk.IsSystem) { Die "Disk $Number е системен. Отказвам." }

    $gb = [math]::Round($disk.Size / 1GB, 1)
    if ($gb -lt 14) { Die "Флашката е само $gb GB. Трябват поне 16 GB (за пълен .raw образ — 64 GB)." }

    Write-Host ""
    Write-Host "  ЩЕ БЪДЕ ИЗТРИТО ВСИЧКО НА:" -ForegroundColor Red
    Write-Host ("    Disk {0} — {1} — {2} GB" -f $disk.Number, $disk.FriendlyName, $gb) -ForegroundColor Red
    Write-Host ""
    $answer = Read-Host "  Напиши ИЗТРИЙ (с главни букви), за да продължиш"
    if ($answer -cne 'ИЗТРИЙ') { Die "Отказано. Нищо не е променено." }

    return $disk
}

# ------------------------------------------------- сваляне на инсталатора ----

function Get-MacOSInstaller {
    param([string]$Version, [string]$Dir)

    $gibDir = Join-Path $Dir 'gibMacOS-master'
    if (-not (Test-Path $gibDir)) {
        $zip = Join-Path $Dir 'gibMacOS.zip'
        Say "  Свалям gibMacOS (инструментът, който говори с каталога на Apple)…"
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $GibUrl -OutFile $zip -UseBasicParsing
        Expand-Archive -Path $zip -DestinationPath $Dir -Force
        Remove-Item $zip -Force
        Ok "gibMacOS е готов."
    } else {
        Ok "gibMacOS вече е свален."
    }

    $bat = Join-Path $gibDir 'gibMacOS.bat'
    if (-not (Test-Path $bat)) { Die "gibMacOS.bat не е намерен в $gibDir." }

    Say "  Свалям recovery образа на macOS $Version от Apple…"
    Warn "Ако липсва Python, gibMacOS ще предложи да го инсталира — приеми."
    & $bat -r -v $Version
    if ($LASTEXITCODE -ne 0) { Warn "gibMacOS върна код $LASTEXITCODE — проверявам какво все пак е свалено." }

    $base = Get-ChildItem -Path $gibDir -Filter 'BaseSystem.dmg' -Recurse -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $base) {
        Die "BaseSystem.dmg не е свален. Пусни ръчно `"$bat`" и си избери версия от менюто, после пусни този скрипт пак."
    }
    Ok "Намерен: $($base.FullName)"
    return $base.Directory.FullName
}

# ---------------------------------------------------- подготовка на диска ----

function New-RecoveryUsb {
    param([int]$Number, [string]$SourceDir)

    Say "  Изчиствам диска и правя GPT + FAT32 дял…"
    Clear-Disk -Number $Number -RemoveData -RemoveOEM -Confirm:$false
    Initialize-Disk -Number $Number -PartitionStyle GPT -ErrorAction SilentlyContinue | Out-Null

    # FAT32 не може над 32 GB през Format-Volume — режем дяла до 30 GB.
    $disk    = Get-Disk -Number $Number
    $maxSize = [math]::Min($disk.Size - 10MB, 30GB)
    $part    = New-Partition -DiskNumber $Number -Size $maxSize -AssignDriveLetter
    Start-Sleep -Seconds 2
    Format-Volume -Partition $part -FileSystem FAT32 -NewFileSystemLabel 'MACOSINST' -Confirm:$false | Out-Null
    $root = "$($part.DriveLetter):"
    Ok "Флашката е форматирана като $root"

    Say "  Копирам инсталатора в com.apple.recovery.boot…"
    $dest = Join-Path $root 'com.apple.recovery.boot'
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    foreach ($name in 'BaseSystem.dmg', 'BaseSystem.chunklist') {
        $src = Join-Path $SourceDir $name
        if (Test-Path $src) {
            Copy-Item $src -Destination $dest -Force
            Ok $name
        } else {
            Warn "$name липсва в $SourceDir"
        }
    }
    return $root
}

function Write-RawImage {
    param([int]$Number, [string]$Image)

    if (-not (Test-Path $Image)) { Die "Образът $Image не съществува." }
    $size = (Get-Item $Image).Length
    Say ("  Записвам {0} ({1} GB) суров върху Disk {2}…" -f `
        (Split-Path $Image -Leaf), [math]::Round($size / 1GB, 1), $Number)

    Clear-Disk -Number $Number -RemoveData -RemoveOEM -Confirm:$false
    Set-Disk -Number $Number -IsOffline $true
    Start-Sleep -Seconds 2

    $in = $out = $null
    try {
        $in  = [IO.File]::OpenRead($Image)
        $out = New-Object IO.FileStream("\\.\PhysicalDrive$Number", [IO.FileMode]::Open,
                                        [IO.FileAccess]::Write, [IO.FileShare]::ReadWrite)
        $buf     = New-Object byte[] (8MB)
        $written = 0L
        $sw      = [Diagnostics.Stopwatch]::StartNew()
        while (($read = $in.Read($buf, 0, $buf.Length)) -gt 0) {
            $out.Write($buf, 0, $read)
            $written += $read
            if ($sw.Elapsed.TotalSeconds -ge 1) {
                Write-Progress -Activity 'Записване на образа' `
                    -Status ("{0} GB / {1} GB" -f [math]::Round($written/1GB,2), [math]::Round($size/1GB,2)) `
                    -PercentComplete ([int](100 * $written / $size))
                $sw.Restart()
            }
        }
        $out.Flush()
    } finally {
        if ($in)  { $in.Dispose() }
        if ($out) { $out.Dispose() }
        Write-Progress -Activity 'Записване на образа' -Completed
        Set-Disk -Number $Number -IsOffline $false -ErrorAction SilentlyContinue
    }
    Ok "Образът е записан."

    # След суров запис EFI дялът идва от самия образ — намираме го и му даваме буква.
    Start-Sleep -Seconds 3
    $efiPart = Get-Partition -DiskNumber $Number -ErrorAction SilentlyContinue |
               Where-Object { $_.Size -lt 1GB } | Select-Object -First 1
    if ($efiPart -and -not $efiPart.DriveLetter) {
        try {
            $efiPart | Set-Partition -NewDriveLetter (Get-FreeDriveLetter)
            $efiPart = Get-Partition -DiskNumber $Number -PartitionNumber $efiPart.PartitionNumber
        } catch { Warn "Не успях да дам буква на EFI дяла — направи го ръчно с MiniTool (виж README)." }
    }
    if ($efiPart -and $efiPart.DriveLetter) { return "$($efiPart.DriveLetter):" }
    return $null
}

function Get-FreeDriveLetter {
    $used = (Get-Volume | Where-Object DriveLetter).DriveLetter
    foreach ($l in [char[]]([char]'Z'..[char]'E')) { if ($used -notcontains $l) { return $l } }
    Die "Няма свободна буква за устройство."
}

function Copy-EfiFolder {
    param([string]$Source, [string]$Root)

    if (-not (Test-Path $Source)) { Die "EFI папката $Source не съществува." }
    if (-not (Test-Path (Join-Path $Source 'OC'))) {
        Die "В $Source няма подпапка OC. Подай папката 'EFI', генерирана от OpenCore Legacy Patcher."
    }
    Say "  Копирам EFI папката на флашката…"
    Copy-Item -Path $Source -Destination $Root -Recurse -Force
    Ok "EFI е на място."
}

function Test-Result {
    param([string]$Root)

    $checks = @{
        'EFI\BOOT\BOOTx64.efi'                    = $true
        'EFI\OC\OpenCore.efi'                     = $true
        'EFI\OC\config.plist'                     = $true
        'com.apple.recovery.boot\BaseSystem.dmg'  = $false
    }
    $allOk = $true
    foreach ($rel in $checks.Keys | Sort-Object) {
        if (Test-Path (Join-Path $Root $rel)) { Ok $rel }
        else { Warn "липсва: $rel"; if ($checks[$rel]) { $allOk = $false } }
    }
    return $allOk
}

# -------------------------------------------------------------- същинското --

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Magenta
Write-Host "   Hackintosh USB — автоматична подготовка"   -ForegroundColor Magenta
Write-Host "  ==========================================" -ForegroundColor Magenta

Assert-Admin

Step 1 "Проверка на средата и избор на флашка"
if ($PSVersionTable.PSVersion.Major -lt 5) { Die "Трябва PowerShell 5 или по-нов." }
Ok "PowerShell $($PSVersionTable.PSVersion)"

$disks = Show-UsbDisks
if ($DiskNumber -lt 0) {
    Write-Host ""
    Write-Host "  Пусни отново с номера на флашката, например:" -ForegroundColor White
    Write-Host "    .\Make-HackintoshUSB.ps1 -DiskNumber $(if ($disks) { ($disks | Select-Object -First 1).Number } else { 'N' }) -EfiPath `"`$HOME\Desktop\EFI`"" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

$target = Assert-SafeTarget -Number $DiskNumber

New-Item -ItemType Directory -Path $WorkDir -Force | Out-Null

Step 2 "Инсталатор на macOS"
if ($RawImage) {
    Ok "Ползвам готов образ: $RawImage (нищо не се сваля)"
    $sourceDir = $null
} else {
    $sourceDir = Get-MacOSInstaller -Version $MacOSVersion -Dir $WorkDir
}

Step 3 "Записване на флашката"
if ($RawImage) {
    $root = Write-RawImage -Number $DiskNumber -Image $RawImage
    if (-not $root) {
        Warn "EFI дялът не получи буква. Довърши ръчно с MiniTool — стъпка 4 в README.md."
        Write-Host ""
        exit 0
    }
} else {
    $root = New-RecoveryUsb -Number $DiskNumber -SourceDir $sourceDir
}

Step 4 "EFI от OpenCore Legacy Patcher"
if ($EfiPath) {
    Copy-EfiFolder -Source $EfiPath -Root $root
} else {
    Warn "Не подаде -EfiPath. Генерирай EFI с OpenCore Legacy Patcher (README.md, стъпка 3)"
    Warn "и копирай папката в корена на $root"
}

Step 5 "Проверка"
$ready = Test-Result -Root $root

Step 6 "Готово"
if ($ready) {
    Write-Host ""
    Write-Host "  Флашката е готова за boot." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  Флашката е подготвена, но липсва EFI — виж горе." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  Остава ти да направиш:" -ForegroundColor White
Write-Host "    1. BIOS/UEFI → изключи Secure Boot (иначе флашката няма да се появи)"
Write-Host "    2. Boot menu → избери USB устройството"
Write-Host "    3. Disk Utility → изтрий вътрешния диск като APFS, име Macintosh SSD"
Write-Host "    4. Install macOS → 20+ минути"
Write-Host "    5. След инсталация: копирай EFI папката на вътрешния диск,"
Write-Host "       иначе машината не буутва без флашката"
if (-not $RawImage) {
    Write-Host ""
    Warn "Този тип флашка (recovery) сваля macOS по време на инсталацията —"
    Warn "трябва ти жичен интернет (Ethernet адаптер), ако Wi-Fi не се поддържа."
}
Write-Host ""
