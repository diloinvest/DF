# check-usb.ps1 — помощник за Hackintosh флашка (само проверки, нищо не пише)
#
# Употреба (PowerShell на Windows):
#   .\check-usb.ps1                    # показва сменяемите устройства и дяловете им
#   .\check-usb.ps1 -EfiPath D:\EFI    # проверява и структурата на EFI папката
#
# Скриптът НЕ форматира и НЕ променя нищо. Записването се прави ръчно с
# balenaEtcher и MiniTool Partition Wizard — виж README.md.

param(
    [string]$EfiPath
)

Write-Host "`n=== Сменяеми устройства ===" -ForegroundColor Cyan
$disks = Get-Disk | Where-Object { $_.BusType -eq 'USB' }
if (-not $disks) {
    Write-Host "Няма открита USB флашка. Включи я и пусни скрипта отново." -ForegroundColor Yellow
} else {
    foreach ($d in $disks) {
        $sizeGb = [math]::Round($d.Size / 1GB, 1)
        Write-Host ("`nDisk {0}: {1} — {2} GB, стил: {3}" -f $d.Number, $d.FriendlyName, $sizeGb, $d.PartitionStyle)
        if ($sizeGb -lt 60) {
            Write-Host "  ! Под 64 GB — може да не стигне за образа на Tahoe." -ForegroundColor Yellow
        }
        Get-Partition -DiskNumber $d.Number -ErrorAction SilentlyContinue | ForEach-Object {
            $letter = if ($_.DriveLetter) { "$($_.DriveLetter):" } else { "(без буква)" }
            $pSize  = [math]::Round($_.Size / 1GB, 2)
            Write-Host ("   дял {0}  {1,-12} {2,7} GB  тип: {3}" -f $_.PartitionNumber, $letter, $pSize, $_.Type)
        }
    }
}

if (-not $EfiPath) {
    Write-Host "`nСъвет: пусни отново с -EfiPath <път>, за да проверя EFI папката." -ForegroundColor DarkGray
    return
}

Write-Host "`n=== Проверка на EFI папката: $EfiPath ===" -ForegroundColor Cyan
if (-not (Test-Path $EfiPath)) {
    Write-Host "Пътят не съществува." -ForegroundColor Red
    return
}

# Минималната структура, която OpenCore очаква
$expected = @(
    'BOOT\BOOTx64.efi',
    'OC\OpenCore.efi',
    'OC\config.plist',
    'OC\Drivers',
    'OC\Kexts'
)

$ok = $true
foreach ($item in $expected) {
    $full = Join-Path $EfiPath $item
    if (Test-Path $full) {
        Write-Host ("  OK      {0}" -f $item) -ForegroundColor Green
    } else {
        Write-Host ("  ЛИПСВА  {0}" -f $item) -ForegroundColor Red
        $ok = $false
    }
}

if ($ok) {
    Write-Host "`nEFI папката изглежда пълна. Не забравяй да върнеш типа на дяла на" -ForegroundColor Green
    Write-Host "'EFI System Partition' в MiniTool и да изключиш Secure Boot в BIOS." -ForegroundColor Green
} else {
    Write-Host "`nПосочи папката 'EFI' (тази, която съдържа BOOT и OC), не дяла отгоре." -ForegroundColor Yellow
}
