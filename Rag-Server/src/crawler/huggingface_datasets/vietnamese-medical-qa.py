import requests
import time

dataset = "hungnm/vietnamese-medical-qa"
config = "default"
split = "train"
limit = 100
offset = 0
all_rows = []

while True:
    url = (
        f"https://datasets-server.huggingface.co/rows?"
        f"dataset={dataset}&config={config}&split={split}"
        f"&offset={offset}&length={limit}"
    )

    print(f"Đang tải offset={offset} ...")
    response = requests.get(url)
    try:
        data = response.json()
    except Exception as e:
        print("Lỗi khi parse JSON:", e)
        print("Status:", response.status_code)
        print("Text:", response.text[:500])
        exit()

    rows = data.get("rows", [])
    if not rows:
        break  # Hết dữ liệu

    all_rows.extend(rows)

    if len(rows) < limit:
        break  # Đây là trang cuối

    offset += limit
    time.sleep(5)  # chờ nhẹ cho API server đỡ bị spam

print(f"Tải xong {len(all_rows)} dòng!")

# Lưu ra file JSON (tuỳ chọn)
import json
with open("D:/AI_Project/Health_Care_AI/data/raw/vietnamese_medical_qa.json", "w", encoding="utf-8") as f:
    json.dump(all_rows, f, ensure_ascii=False, indent=2)
