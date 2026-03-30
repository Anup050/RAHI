import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

def train_model():
    # 1. Load Data
    data_path = "data/Training.csv"
    if not os.path.exists(data_path):
        print(f"❌ Error: {data_path} not found.")
        return

    try:
        dataset = pd.read_csv(data_path)
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return

    # 2. Preprocessing
    # Handle potential trailing commas causing empty columns
    dataset = dataset.dropna(axis=1, how='all')
    
    # Identify Target Column
    target_col = "prognosis"
    if target_col not in dataset.columns:
        # Fallback: assume last non-empty column is target
        target_col = dataset.columns[-1]
        print(f"⚠️ 'prognosis' column not found. Using last column: {target_col}")

    X = dataset.drop(columns=[target_col])
    y = dataset[target_col]
    
    # Clean X: Ensure all are numeric
    # Drop any leftover non-numeric columns just in case
    X = X.select_dtypes(include=[np.number])

    # Save the column names (symptoms) so we can map user input later
    symptoms_list = list(X.columns)
    joblib.dump(symptoms_list, "symptoms_list.pkl")
    print(f"✅ Saved {len(symptoms_list)} symptoms to symptoms_list.pkl")

    # 3. Train Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Train Random Forest
    print("⏳ Training Random Forest Model...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # 5. Evaluate
    preds = rf_model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"🚀 Model Trained. Accuracy: {acc * 100:.2f}%")

    # 6. Save Model
    joblib.dump(rf_model, "model_final.pkl")
    print("✅ Model saved to model_final.pkl")

if __name__ == "__main__":
    train_model()
