import os
import struct
import zlib


def png_chunk(tag, data):
    return (
        struct.pack("!I", len(data))
        + tag
        + data
        + struct.pack("!I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path, size, rgb=(34, 197, 94)):
    width = height = size
    r, g, b = rgb
    # RGBA rows with filter byte 0
    row = bytes([0] + [r, g, b, 255] * width)
    raw = row * height
    compressed = zlib.compress(raw, level=9)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack("!IIBBBBB", width, height, 8, 6, 0, 0, 0)
    data = sig + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", compressed) + png_chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(data)


def main():
    root = os.path.dirname(os.path.dirname(__file__))
    icons_dir = os.path.join(root, "icons")
    os.makedirs(icons_dir, exist_ok=True)
    write_png(os.path.join(icons_dir, "icon-192x192.png"), 192)
    write_png(os.path.join(icons_dir, "icon-512x512.png"), 512)
    print("Generated valid PNG icons: 192x192, 512x512")


if __name__ == "__main__":
    main()
