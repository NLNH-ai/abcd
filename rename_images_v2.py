import os
import sys

# Set encoding to utf-8 for output
sys.stdout.reconfigure(encoding='utf-8')

base_dir = "images"
files = os.listdir(base_dir)
print(f"Files in {base_dir}: {files}")

mapping = {
    "건희.png": "member-geonhee.png",
    "경준.jpeg": "member-kyungjun.jpeg",
    "고양이.jpg": "cat-mascot.jpg",
    "앨범 소개 2.png": "album-intro-2.png",
    "앨범 소개 3.png": "album-intro-3.png",
    "앨범 표지 1.png": "album-cover-1.png",
    "윤태.png": "member-yuntae.png",
    "진호.png": "member-jinho.png",
    "찬희.png": "member-chanhee.png",
    "현상금 윤태.png": "wanted-yuntae.png"
}

for filename in files:
    if filename in mapping:
        old_path = os.path.join(base_dir, filename)
        new_path = os.path.join(base_dir, mapping[filename])
        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} -> {mapping[filename]}")
        except Exception as e:
            print(f"Error renaming {filename}: {e}")
    else:
        # Try to match loosely if exact match fails (e.g. normalization issues)
        for k, v in mapping.items():
            if k in filename: # Very simple loose match
                 # Be careful here, but for this specific set it might be okay if exact match fails
                 pass
