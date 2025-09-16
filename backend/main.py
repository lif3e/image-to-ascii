# backend/main.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image, UnidentifiedImageError
import math

app = FastAPI(title="Image→ASCII API")

# Allow local dev origins (adjust in production)
origins = [
    "http://localhost:5173",  # Vite
    "http://localhost:3000",  # CRA / other dev
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASCII_CHARS = "@%#*+=-:. "  # dark->light

def image_to_ascii(image_bytes: bytes, new_width: int = 100) -> str:
    # Open image from bytes
    try:
        img = Image.open(BytesIO(image_bytes))
    except UnidentifiedImageError:
        raise ValueError("Invalid image file.")
    # Convert to grayscale
    img = img.convert("L")  # 'L' mode = 8-bit pixels, black and white

    orig_width, orig_height = img.size
    if new_width <= 0:
        raise ValueError("Width must be > 0")

    # Characters are taller than they are wide; compensate with an aspect ratio factor.
    # Typical value ~0.5-0.6: tune for your chosen font. 0.55 is a good starting point.
    char_aspect = 0.55
    new_height = max(1, int((orig_height / orig_width) * new_width * char_aspect))

    img = img.resize((new_width, new_height), Image.LANCZOS)

    pixels = img.getdata()
    chars = []
    palette_len = len(ASCII_CHARS)
    for p in pixels:
        # p is 0..255 (0 black, 255 white)
        idx = int(p / 255 * (palette_len - 1))
        chars.append(ASCII_CHARS[idx])

    # join into lines
    ascii_lines = []
    for i in range(0, len(chars), new_width):
        ascii_lines.append("".join(chars[i:i + new_width]))

    return "\n".join(ascii_lines)

@app.post("/convert")
async def convert(file: UploadFile = File(...), width: int = Form(100)):
    # basic validation
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    body = await file.read()
    try:
        ascii_text = image_to_ascii(body, new_width=width)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"ascii": ascii_text}
