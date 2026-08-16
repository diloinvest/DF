"""Гласов разговор с Claude на български.

Реч → текст:  faster-whisper (локално, на GPU)
Разговор:     Claude API
Текст → реч:  edge-tts (по подразбиране) или Piper (изцяло локално)

Стартиране:
    set ANTHROPIC_API_KEY=sk-ant-...
    python server.py
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import anthropic
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger("bg-voice")

HERE = Path(__file__).parent

# --- Настройки (всичко се овъррайдва през environment променливи) ---------

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "large-v3")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cuda")
WHISPER_COMPUTE = os.getenv("WHISPER_COMPUTE", "float16")

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-5")
CLAUDE_EFFORT = os.getenv("CLAUDE_EFFORT", "low")  # low дава най-малка латентност

TTS_ENGINE = os.getenv("TTS_ENGINE", "edge")  # "edge" или "piper"
TTS_VOICE = os.getenv("TTS_VOICE", "bg-BG-BorislavNeural")  # или bg-BG-KalinaNeural
TTS_RATE = os.getenv("TTS_RATE", "+10%")
PIPER_BIN = os.getenv("PIPER_BIN", "piper")
PIPER_MODEL = os.getenv("PIPER_MODEL", str(HERE / "voices" / "bg_BG-dimitar-medium.onnx"))

SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    """Ти си гласов асистент и говориш САМО на български език.

Отговорите ти се четат на глас, затова:
- Пиши кратко — две-три изречения, освен ако не те помолят за повече.
- Само обикновен текст. Без markdown, без списъци с тирета, без код блокове,
  без емоджи, без заглавия — те звучат зле, когато се четат на глас.
- Числата, съкращенията и мерните единици ги изписвай с думи, както се
  произнасят: "двайсет и три лева", а не "23 лв.".
- Говори естествено и разговорно, както човек говори по телефона.

Ако потребителят премине на друг език, отговаряй на неговия език.""",
)

app = FastAPI(title="bg-voice")

_whisper = None
_whisper_lock = asyncio.Lock()
_claude = anthropic.AsyncAnthropic()


# --- Реч → текст ----------------------------------------------------------


async def get_whisper():
    """Зарежда модела при първата заявка; пада към CPU, ако няма GPU."""
    global _whisper
    async with _whisper_lock:
        if _whisper is None:
            from faster_whisper import WhisperModel

            device, compute = WHISPER_DEVICE, WHISPER_COMPUTE
            try:
                log.info("Зареждам Whisper %s на %s (%s)...", WHISPER_MODEL, device, compute)
                _whisper = WhisperModel(WHISPER_MODEL, device=device, compute_type=compute)
            except Exception as exc:  # noqa: BLE001 - искаме всякакъв CUDA проблем
                if device == "cpu":
                    raise
                log.warning("GPU не е достъпен (%s). Минавам на CPU с int8.", exc)
                _whisper = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
            log.info("Whisper е готов.")
    return _whisper


def _transcribe(model, path: str) -> str:
    segments, _info = model.transcribe(
        path,
        language="bg",
        beam_size=5,
        vad_filter=True,  # реже тишината — по-бързо и по-малко халюцинации
        vad_parameters={"min_silence_duration_ms": 400},
        condition_on_previous_text=False,
    )
    return " ".join(seg.text.strip() for seg in segments).strip()


async def transcribe(audio: bytes, suffix: str) -> str:
    model = await get_whisper()
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio)
        path = tmp.name
    try:
        # faster-whisper е синхронен и държи GIL-а — пускаме го в нишка.
        return await asyncio.to_thread(_transcribe, model, path)
    finally:
        os.unlink(path)


# --- Разговор -------------------------------------------------------------


class Turn(BaseModel):
    role: str
    content: str


async def ask_claude(history: list[Turn], user_text: str) -> str:
    messages = [{"role": t.role, "content": t.content} for t in history[-20:]]
    messages.append({"role": "user", "content": user_text})

    response = await _claude.beta.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        output_config={"effort": CLAUDE_EFFORT},
        messages=messages,
        # Ако защитните класификатори откажат заявката, тя се пре-изпълнява
        # автоматично на резервен модел вместо да върне празен отговор.
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )

    if response.stop_reason == "refusal":
        return "Съжалявам, не мога да отговоря на това. Да пробваме нещо друго?"

    return "".join(b.text for b in response.content if b.type == "text").strip()


# --- Текст → реч ----------------------------------------------------------


async def synthesize_edge(text: str) -> tuple[bytes, str]:
    import edge_tts

    communicate = edge_tts.Communicate(text, TTS_VOICE, rate=TTS_RATE)
    audio = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
    return bytes(audio), "audio/mpeg"


def _run_piper(text: str, out_path: str) -> None:
    subprocess.run(
        [PIPER_BIN, "--model", PIPER_MODEL, "--output_file", out_path],
        input=text.encode("utf-8"),
        check=True,
        capture_output=True,
    )


async def synthesize_piper(text: str) -> tuple[bytes, str]:
    if not Path(PIPER_MODEL).exists():
        raise HTTPException(500, f"Липсва Piper модел: {PIPER_MODEL}")
    if shutil.which(PIPER_BIN) is None:
        raise HTTPException(500, f"Piper не е намерен в PATH: {PIPER_BIN}")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        path = tmp.name
    try:
        await asyncio.to_thread(_run_piper, text, path)
        return Path(path).read_bytes(), "audio/wav"
    finally:
        os.unlink(path)


async def synthesize(text: str) -> tuple[bytes, str]:
    if TTS_ENGINE == "piper":
        return await synthesize_piper(text)
    return await synthesize_edge(text)


# --- HTTP ----------------------------------------------------------------


@app.post("/api/turn")
async def turn(
    audio: UploadFile = File(...),
    history: str = Form("[]"),
):
    """Един ход: аудио → текст → отговор от Claude."""
    raw = await audio.read()
    if len(raw) < 2000:
        return {"user": "", "reply": ""}  # твърде кратко, най-вероятно шум

    suffix = ".mp4" if "mp4" in (audio.content_type or "") else ".webm"
    user_text = await transcribe(raw, suffix)
    if not user_text:
        return {"user": "", "reply": ""}

    log.info("Потребител: %s", user_text)
    turns = [Turn(**t) for t in json.loads(history)]
    reply = await ask_claude(turns, user_text)
    log.info("Claude: %s", reply)
    return {"user": user_text, "reply": reply}


class TTSRequest(BaseModel):
    text: str


@app.post("/api/tts")
async def tts(req: TTSRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(400, "Празен текст")
    audio, media_type = await synthesize(text)
    return Response(content=audio, media_type=media_type)


@app.get("/api/health")
async def health():
    return {
        "whisper": {"model": WHISPER_MODEL, "device": WHISPER_DEVICE, "loaded": _whisper is not None},
        "claude": CLAUDE_MODEL,
        "tts": {"engine": TTS_ENGINE, "voice": TTS_VOICE if TTS_ENGINE == "edge" else PIPER_MODEL},
    }


@app.get("/")
async def index():
    return FileResponse(HERE / "static" / "index.html")


app.mount("/static", StaticFiles(directory=HERE / "static"), name="static")


if __name__ == "__main__":
    import uvicorn

    if not (os.getenv("ANTHROPIC_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")):
        raise SystemExit("Задай ANTHROPIC_API_KEY преди да стартираш сървъра.")

    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        ssl_certfile=os.getenv("SSL_CERT") or None,
        ssl_keyfile=os.getenv("SSL_KEY") or None,
    )
