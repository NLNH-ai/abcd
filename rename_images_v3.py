import os

base_dir = "images"
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

log_file = "rename_log.txt"

with open(log_file, "w", encoding="utf-8") as log:
    try:
        files = os.listdir(base_dir)
        log.write(f"Files found: {files}\n")
        
        for filename in files:
            # Normalize filename if needed (NFC/NFD) but usually os.listdir gives what matches the filesystem
            if filename in mapping:
                old_path = os.path.join(base_dir, filename)
                new_path = os.path.join(base_dir, mapping[filename])
                try:
                    os.rename(old_path, new_path)
                    log.write(f"Renamed: {filename} -> {mapping[filename]}\n")
                except Exception as e:
                    log.write(f"Error renaming {filename}: {e}\n")
            else:
                log.write(f"Skipped: {filename}\n")
                
    except Exception as e:
        log.write(f"Global error: {e}\n")

print("Done")
