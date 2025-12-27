from PIL import Image
from pathlib import Path

OUTPUT = Path(__file__).parent / "output"
frames = sorted(OUTPUT.glob('frame_*.png'))
if not frames:
    print('No frames found in', OUTPUT)
    raise SystemExit(1)

images = [Image.open(p).convert('RGBA') for p in frames]
# Resize to a reasonable width for web embedding (optional)
max_width = 640
if images[0].width > max_width:
    ratio = max_width / images[0].width
    images = [img.resize((int(img.width*ratio), int(img.height*ratio)), Image.LANCZOS) for img in images]

out_path = OUTPUT / 'monkey_demo.gif'
images[0].save(out_path, save_all=True, append_images=images[1:], duration=80, loop=0)
print('Saved GIF to', out_path)
