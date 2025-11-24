import os

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

base_dir = "images"

for old_name, new_name in mapping.items():
    old_path = os.path.join(base_dir, old_name)
    new_path = os.path.join(base_dir, new_name)
    
    if os.path.exists(old_path):
        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {old_name} -> {new_name}")
        except Exception as e:
            print(f"Error renaming {old_name}: {e}")
    else:
        print(f"File not found: {old_name}")
