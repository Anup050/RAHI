import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def train_model():
    print("Loading dataset...")
    try:
        df = pd.read_csv("data/Training.csv")
    except FileNotFoundError:
        print("Error: data/Training.csv not found.")
        return

    # Separate features and target
    # The last column is 'prognosis' (Target)
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]
    
    # Save the feature names (symptoms) to mapping file
    # This is crucial for matching user input text to model features during inference
    symptoms = list(X.columns)
    
    os.makedirs("models", exist_ok=True)
    with open("models/symptoms_list.pkl", "wb") as f:
        pickle.dump(symptoms, f)
    print(f"Symptom list saved ({len(symptoms)} symptoms).")

    # Split data (optional for this full training script, but good practice)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Test accuracy
    accuracy = model.score(X_test, y_test)
    print(f"Model Training Complete. Test Accuracy: {accuracy*100:.2f}%")
    
    # Save the trained model
    with open("models/model_final.pkl", "wb") as f:
        pickle.dump(model, f)
    print("Model saved to models/model_final.pkl")

if __name__ == "__main__":
    train_model()
