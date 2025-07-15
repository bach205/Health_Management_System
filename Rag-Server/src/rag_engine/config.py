"""
Configuration file for loading LLM models and merging them with LLaMA 3.2b-instruct.
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from pathlib import Path
from peft import PeftModel
import os
from huggingface_hub import login
import subprocess
# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
VECTOR_STORE_DIR = BASE_DIR / "vector_store"

# RAG settings
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
TOP_K_RESULTS = 3
#check = True tra ra response = 0 neu success, =1 neu fail
#text = True, mac dinh gia tri tra ra o stdout , stderr la binary, true chuyen gia tri ve string
#capture_output = True ==> tra ket qua vao bien, mac dinh tra ve stdout va stderr cua subprocess
# loggin_result = subprocess.run(["huggingface-cli","login","--token", token],check=True,text=True,capture_output=True)
token = os.getenv("HF_TOKEN")
if not token or not token.startswith("hf_"):
    raise ValueError("Token sai hoặc chưa đặt biến môi trường!")

login(token)  
print("Đăng nhập thành công với huggingface_hub")
def load_llms_model_merged(base_model_path=None,peft_model_path=None):
    """
    Load the LLM model and merge it with LLaMA 3.2b-instruct.
    Returns the merged model and tokenizer.
    """
    # Load the base LLaMA 3.2b-instruct model
    if(base_model_path == None):
        base_model_path = "meta-llama/Llama-3.2-1B-Instruct"
        base_tokenizer_path = "meta-llama/Llama-3.2-1B-Instruct"
    base_model = AutoModelForCausalLM.from_pretrained(base_model_path)
    base_tokenizer = AutoTokenizer.from_pretrained(base_tokenizer_path)

    # # Load the additional model to merge
    # if(peft_model_path == None):
    #     peft_model_path = MODELS_DIR / "llm" / "v1" / "fine_tuned_model"
    # peft_model = PeftModel.from_pretrained(base_model, peft_model_path)
    # # Merge the models (example: parameter averaging or other techniques)
    # merged_model = peft_model.merge_and_unload()

    # # Return the merged model and tokenizer
    # merged_model.eval()  # Set the model to evaluation mode
    merged_model =  base_model.eval()
    return {"model": merged_model, "tokenizer": base_tokenizer}