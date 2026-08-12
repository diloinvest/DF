# Hackintosh USB — чеклист за печат

Едностранична версия на `README.md`. Отметни докато вървиш.

## Подготовка
- [ ] Флашка 64 GB (ще се изтрие изцяло)
- [ ] `Tahoe.raw` свален
- [ ] balenaEtcher инсталиран
- [ ] OpenCore Legacy Patcher свален
- [ ] MiniTool Partition Wizard Free инсталиран
- [ ] Интернет връзка активна
- [ ] Бекъп на всичко от вътрешния диск (Windows ще се изтрие)

## Записване на образа
- [ ] Etcher → Flash from file → `Tahoe.raw`
- [ ] Select target → флашката (**провери устройството!**)
- [ ] Flash → Yes → изчакай

## EFI папка
- [ ] `.bat` на OpenCore → Run as administrator
- [ ] Python install prompt → `Y`
- [ ] `1` hardware report → `E` export
- [ ] **Записал съм кое е unsupported:** ______________________
- [ ] Версия → `25` (macOS Tahoe)
- [ ] Аудио → `1`
- [ ] `6` build EFI → `yes` → `99` → Enter
- [ ] EFI папката е преместена на Desktop

## Флашка: EFI дял
- [ ] MiniTool → десен бутон на EFI дяла → Delete
- [ ] Десен бутон на unallocated → Create → Yes
- [ ] FAT32, label `EFI` → OK → **Apply**
- [ ] Копирана EFI папката от Desktop в дяла
- [ ] Change Partition Type ID → EFI System Partition → Yes → **Apply**

## BIOS и инсталация
- [ ] **Secure Boot изключен**
- [ ] Boot от USB → Install macOS Tahoe
- [ ] Disk Utility → вътрешен диск → Erase → име `Macintosh SSD`, формат **APFS**
- [ ] Install macOS Tahoe → Macintosh SSD → Continue (20+ мин.)
- [ ] Setup: „My computer does not connect to the internet", ако Wi-Fi е сив
- [ ] Акаунт + парола → Get Started

## След инсталацията
- [ ] EFI папката копирана на вътрешния диск (иначе не буутва без флашка)
- [ ] Software Update инсталиран (оправя звука)
- [ ] Ethernet адаптер тестван, ако Wi-Fi не работи
