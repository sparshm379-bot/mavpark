"""Generate minimal placeholder PNG assets for Expo."""
import struct, zlib, os

def make_png(width, height, r, g, b):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    IHDR = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    raw = b''
    for _ in range(height):
        raw += b'\x00' + bytes([r, g, b] * width)
    IDAT = zlib.compress(raw)

    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', IHDR)
            + chunk(b'IDAT', IDAT)
            + chunk(b'IEND', b''))

assets_dir = r'C:\Users\spars\mavpark\app\assets'
os.makedirs(assets_dir, exist_ok=True)

# UTA blue background
BLUE = (0, 56, 101)   # #003865

files = {
    'icon.png':          (1024, 1024, *BLUE),
    'splash.png':        (1284, 2778, *BLUE),
    'adaptive-icon.png': (1024, 1024, *BLUE),
    'favicon.png':       (48,   48,   *BLUE),
}

for name, (w, h, r, g, b) in files.items():
    path = os.path.join(assets_dir, name)
    with open(path, 'wb') as f:
        f.write(make_png(w, h, r, g, b))
    print(f'Created {name} ({w}x{h})')
