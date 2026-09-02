#!/usr/bin/env python3
"""Key magenta JPEG/PNG sprites to transparent PNGs and tight-crop them."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

OUT = Path("/workspace/public/sprites")
TEX = Path("/workspace/public/textures")
OUT.mkdir(parents=True, exist_ok=True)
TEX.mkdir(parents=True, exist_ok=True)

SPRITES = {
    "pulse": "/workspace/artifacts/imagine_images/6a2eb43e-ad11-4f0e-b927-a4a79fab12db.jpg",
    "beam": "/workspace/artifacts/imagine_images/e533905f-10ce-4c10-a58f-9ef1503e85d7.jpg",
    "nova": "/workspace/artifacts/imagine_images/5177e1c0-071a-42f3-9eac-bba4955c4481.jpg",
    "tesla": "/workspace/artifacts/imagine_images/899fffb1-1887-4e85-9b1f-4c10870c4569.jpg",
    "bit": "/workspace/artifacts/imagine_images/8c236166-73a8-4d1b-9947-90b08846af22.jpg",
    "virus": "/workspace/artifacts/imagine_images/6dfa1fa6-c9b6-4e3a-80dc-a141c906bbf6.jpg",
    "tank": "/workspace/artifacts/imagine_images/eb1b8233-4be7-478e-be72-12c6d210c487.jpg",
    "boss": "/workspace/artifacts/imagine_images/b8274634-1715-432b-996a-dfa1cff9b258.jpg",
    "core": "/workspace/artifacts/imagine_images/32cc3cbb-29a1-43a1-a267-50f5fdbf5e5d.jpg",
    "pad": "/workspace/artifacts/imagine_images/54935119-5e1e-4d43-bb4a-b09c7dc9056d.jpg",
}


def chroma(path: str, dest: Path, size: int = 256) -> None:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img).astype(np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    mag = np.minimum(r, b)
    score = mag - g
    # JPEG-safe magenta key
    alpha = np.clip(255.0 - np.maximum(score - 28.0, 0.0) * 2.4, 0.0, 255.0)
    near = (r > 170) & (b > 170) & (g < 130)
    alpha = np.where(near & (score > 50), np.minimum(alpha, 40), alpha)
    hard = (r > 210) & (b > 210) & (g < 90)
    alpha = np.where(hard, 0.0, alpha)
    # despill remaining fringe toward luminance
    spill = np.clip((np.minimum(r, b) - g) / 180.0, 0.0, 1.0)
    g = g + spill * (np.minimum(r, b) - g) * 0.65
    arr[:, :, 1] = g
    arr[:, :, 3] = np.minimum(a, alpha)
    rgba = np.clip(arr, 0, 255).astype(np.uint8)
    # crop to opaque bbox
    mask = rgba[:, :, 3] > 18
    if mask.any():
        ys, xs = np.where(mask)
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        pad = int(max(y1 - y0, x1 - x0) * 0.08)
        y0 = max(0, y0 - pad)
        x0 = max(0, x0 - pad)
        y1 = min(rgba.shape[0], y1 + pad)
        x1 = min(rgba.shape[1], x1 + pad)
        rgba = rgba[y0:y1, x0:x1]
    out = Image.fromarray(rgba, "RGBA")
    out.thumbnail((size, size), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - out.width) // 2
    oy = (size - out.height) // 2
    canvas.paste(out, (ox, oy), out)
    canvas.save(dest)


def main() -> None:
    for name, src in SPRITES.items():
        dest = OUT / f"{name}.png"
        chroma(src, dest, 320 if name in {"boss", "core", "nova"} else 256)
        print("wrote", dest, dest.stat().st_size)
    import shutil

    shutil.copy(
        "/workspace/artifacts/imagine_images/a5031b26-b761-421c-9f1c-734dd3b8fe91.jpg",
        TEX / "floor.jpg",
    )
    shutil.copy(
        "/workspace/artifacts/imagine_images/51e364f1-30c7-44ab-9508-ae88ca760475.jpg",
        TEX / "path.jpg",
    )
    shutil.copy(
        "/workspace/artifacts/imagine_images/70515cb1-577e-419c-910b-1e43e21fbfb3.jpg",
        TEX / "menu.jpg",
    )
    print("textures copied")


if __name__ == "__main__":
    main()
