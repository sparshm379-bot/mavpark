import zipfile
import os

base = r"C:\Users\spars\mavpark\backend"
out = r"C:\Users\spars\mavpark\backend\deploy.zip"

includes = ["src", "prisma", "package.json", "package-lock.json"]

if os.path.exists(out):
    os.remove(out)

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for item in includes:
        full = os.path.join(base, item)
        if os.path.isfile(full):
            zf.write(full, item.replace("\\", "/"))
        elif os.path.isdir(full):
            for root, dirs, files in os.walk(full):
                for f in files:
                    abs_path = os.path.join(root, f)
                    rel_path = os.path.relpath(abs_path, base).replace("\\", "/")
                    zf.write(abs_path, rel_path)

print(f"Created {out} ({os.path.getsize(out)} bytes)")
