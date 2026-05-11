import joblib
import pandas as pd
import numpy as np
import os
import sys

def test_prediction():
    try:
        model = joblib.load("model_final.pkl")
        symptoms_list = joblib.load("symptoms_list.pkl")
        print(f"Loaded {len(symptoms_list)} symptoms")
        
        # Simulate a prediction with 'fever'
        input_vector = np.zeros(len(symptoms_list))
        symptom_index_map = {s.lower(): i for i, s in enumerate(symptoms_list)}
        
        if "high_fever" in symptom_index_map:
            input_vector[symptom_index_map["high_fever"]] = 1
        
        # Test with the fix (DataFrame)
        print("Testing prediction with DataFrame (fix)...")
        input_df = pd.DataFrame([input_vector], columns=symptoms_list)
        prediction = model.predict(input_df)[0]
        print(f"Prediction: {prediction}")
        
        # Test with raw numpy (to see if warning still appears if we used it)
        # print("Testing prediction with raw numpy (should show warning)...")
        # model.predict([input_vector])
        
    except Exception as e:
        print(f"Error during test: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_prediction()
