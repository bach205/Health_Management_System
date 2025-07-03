import json
from datasets import Dataset

# Giả sử bạn đã load JSON từ file
with open('D:/AI_Project/Health_Care_AI/data/raw/vietnamese_medical_qa.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

# Chuyển đổi dữ liệu về dạng đúng
clean_data = [item['row'] for item in raw_data]

# Tạo Dataset
dataset = Dataset.from_list(clean_data)
dataset.to_json("D:/AI_Project/Health_Care_AI/data/processed/vietnamese_medical_qa_processed.jsonl", orient="records", lines=True)
# In thử để kiểm tra
print(dataset[0])