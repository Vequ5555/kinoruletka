"""Derive Android launcher resources from the approved, unchanged source PNG."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "directors_roulette_selected_icon.png"
RES = ROOT / "app" / "src" / "main" / "res"


def save(image: Image.Image, directory: str) -> None:
    target = RES / directory
    target.mkdir(parents=True, exist_ok=True)
    image.save(target / "ic_launcher.png", optimize=True)


def main() -> None:
    original = Image.open(SOURCE).convert("RGB")
    if original.width != original.height:
        raise ValueError("The approved launcher image must be square")

    # Legacy icons retain every pixel of the supplied composition. Android
    # chooses the density-specific raster without stretching it.
    for density, size in (("mdpi", 48), ("hdpi", 72), ("xhdpi", 96),
                          ("xxhdpi", 144), ("xxxhdpi", 192)):
        save(original.resize((size, size), Image.Resampling.LANCZOS),
             f"mipmap-{density}")

    # Adaptive launchers apply masks of different shapes. Place the complete
    # original inside the 72/108 dp safe area so no logo details are cropped.
    foreground = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
    inset = 72
    artwork = original.resize((432 - 2 * inset, 432 - 2 * inset),
                              Image.Resampling.LANCZOS)
    foreground.paste(artwork, (inset, inset))
    target = RES / "drawable-nodpi"
    target.mkdir(parents=True, exist_ok=True)
    foreground.save(target / "ic_launcher_foreground.png", optimize=True)


if __name__ == "__main__":
    main()
