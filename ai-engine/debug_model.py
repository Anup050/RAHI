import joblib
import numpy as np
import pandas as pd
import sys
import traceback
import os

print("--- DEBUG START ---")
try:
    print(f"CWD: {os.getcwd()}")
    
    # 1. Load Artifacts
    print("Loading model_final.pkl...")
    if not os.path.exists("model_final.pkl"):
        print("ERROR: model_final.pkl does not exist!")
        sys.exit(1)
    model = joblib.load("model_final.pkl")
    print("Model loaded.")

    print("Loading symptoms_list.pkl...")
    if not os.path.exists("symptoms_list.pkl"):
        print("ERROR: symptoms_list.pkl does not exist!")
        sys.exit(1)
    symptoms_list = joblib.load("symptoms_list.pkl")
    print(f"Symptoms loaded. Count: {len(symptoms_list)}")

    # 2. Simulate Prediction
    print("Simulating input vector...")
    input_vector = np.zeros(len(symptoms_list))
    # Set a dummy symptom
    input_vector[0] = 1 
    
    print("Predicting...")
    # Reshape for single sample
    input_vector = input_vector.reshape(1, -1)
    
    prediction = model.predict(input_vector)[0]
    print(f"Prediction: {prediction}")
    
    probs = model.predict_proba(input_vector)[0]
    print(f"Confidence: {max(probs)}")
    print("--- SUCCESS ---")

except Exception:
    print("--- EXCEPTION OCCURRED ---")
    traceback.print_exc()
