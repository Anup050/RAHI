import joblib
import os
import sys
import psutil

def check_memory():
    process = psutil.Process(os.getpid())
    mem_before = process.memory_info().rss / 1024 / 1024
    print(f"Memory before loading: {mem_before:.2f} MB")
    
    model = joblib.load("model_final.pkl")
    symptoms = joblib.load("symptoms_list.pkl")
    
    mem_after = process.memory_info().rss / 1024 / 1024
    print(f"Memory after loading: {mem_after:.2f} MB")
    print(f"Model size in memory: {mem_after - mem_before:.2f} MB")

if __name__ == "__main__":
    check_memory()
