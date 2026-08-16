# Гласов разговор с Claude на български

Локален сървър, който ти позволява да говориш с Claude на български в реално време —
от компютъра и от телефона.

```
микрофон → faster-whisper (локално, на GPU) → Claude API → edge-tts / Piper → говор
```

Сървърът се пуска на Windows машината с NVIDIA картата. Телефонът се закача към нея
през браузъра — не се инсталира приложение.

---

## 1. Инсталация (Windows + NVIDIA)

Нужни са ти **Python 3.10+** и актуален NVIDIA драйвер.

```powershell
git clone <това-репо>
cd DF\bg-voice

python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt
```

Ако ще ползваш GPU (силно препоръчително — иначе `large-v3` е бавен), инсталирай
PyTorch с CUDA **преди** останалото:

```powershell
pip install torch --index-url https://download.pytorch.org/whl/cu124
```

### Ключ за Claude

```powershell
setx ANTHROPIC_API_KEY "sk-ant-..."
```

Затвори и отвори наново терминала, за да се вземе променливата.

---

## 2. Стартиране

```powershell
python server.py
```

Първото пускане тегли модела на Whisper (`large-v3` е ~3 GB) — отнема няколко минути.
След това провери в браузъра на самия компютър:

```
http://localhost:8000
```

На `localhost` микрофонът работи и без HTTPS.

---

## 3. Достъп от iPhone

Браузърите **не дават достъп до микрофона през обикновен HTTP**, освен на `localhost`.
За телефона ти трябва HTTPS. Два варианта:

### Вариант А — Cloudflare Tunnel (най-лесен, работи и извън дома)

Свали [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
и в отделен терминал пусни:

```powershell
cloudflared tunnel --url http://localhost:8000
```

Получаваш адрес от вида `https://нещо-случайно.trycloudflare.com` — отваряш го в
Safari на телефона и си готов. Адресът е публичен, макар и труден за налучкване;
спреш ли `cloudflared`, изчезва.

### Вариант Б — самоподписан сертификат (само в домашната мрежа)

```powershell
# инсталирай mkcert, после:
mkcert -install
mkcert 192.168.0.42   # смени с реалния IP на компютъра

set SSL_CERT=192.168.0.42.pem
set SSL_KEY=192.168.0.42-key.pem
python server.py
```

После отваряш `https://192.168.0.42:8000` на телефона. Safari ще се оплаче от
сертификата — трябва да инсталираш root сертификата на mkcert в телефона
(Настройки → Общи → VPN и управление на устройство), иначе микрофонът пак няма да тръгне.

---

## 4. Как се използва

Два режима, превключват се горе вдясно:

- **Свободни ръце** — натискаш веднъж, говориш, спираш; след ~1 секунда тишина
  записът се изпраща автоматично и разговорът продължава в цикъл.
- **Задръж за говор** — държиш бутона докато говориш, пускаш го за изпращане.
  По-надежден в шумна среда.

---

## 5. Настройки

Всичко се управлява през environment променливи:

| Променлива | По подразбиране | Какво прави |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Задължителна |
| `WHISPER_MODEL` | `large-v3` | `medium` е 2–3× по-бърз с малко по-слаба точност на български |
| `WHISPER_DEVICE` | `cuda` | `cpu`, ако няма GPU (пада автоматично при грешка) |
| `WHISPER_COMPUTE` | `float16` | `int8_float16` пести видеопамет |
| `CLAUDE_MODEL` | `claude-opus-5` | |
| `CLAUDE_EFFORT` | `low` | `medium`/`high` — по-умни, но по-бавни отговори |
| `TTS_ENGINE` | `edge` | `piper` за изцяло локален глас |
| `TTS_VOICE` | `bg-BG-BorislavNeural` | или `bg-BG-KalinaNeural` (женски) |
| `TTS_RATE` | `+10%` | скорост на говора |
| `SYSTEM_PROMPT` | виж `server.py` | инструкциите към Claude |
| `PORT` | `8000` | |

### Изцяло локален глас (Piper)

`edge-tts` праща текста на отговора до Microsoft, за да го озвучи — качеството е
по-добро и е безплатно, но не е локално. Ако това не ти върши работа:

```powershell
pip install piper-tts
mkdir voices
# свали bg_BG-dimitar-medium.onnx и .onnx.json от:
# https://huggingface.co/rhasspy/piper-voices/tree/main/bg/bg_BG/dimitar/medium
set TTS_ENGINE=piper
```

Разпознаването на речта (Whisper) е локално и в двата случая — записът на гласа ти
не напуска машината. През Claude API минава само текстът.

---

## 6. Ако нещо не работи

| Проблем | Причина |
|---|---|
| „Няма достъп до микрофона" на телефона | Страницата не е през HTTPS — виж точка 3 |
| Whisper тръгва на CPU въпреки GPU-то | Липсва CUDA-версията на PyTorch; провери `/api/health` |
| Първият отговор се бави много | Моделът се зарежда при първата заявка — после е бърз |
| Реже те по средата на изречението | Вдигни `SILENCE_MS` в `static/index.html` или мини на „Задръж за говор" |
| Разпознава на английски | Езикът е фиксиран на `bg` в `server.py`; ако е тихо, Whisper понякога халюцинира — говори по-близо до микрофона |

Диагностика: `http://localhost:8000/api/health`
