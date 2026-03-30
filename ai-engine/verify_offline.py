import sys
import os

# Ensure we can import from current directory
sys.path.append(os.getcwd())

try:
    import main
    from main import SymptomRequest
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def test():
    print("1. Loading artifacts...")
    try:
        main.load_artifacts()
    except Exception as e:
        print(f"Failed to load artifacts: {e}")
        return

    print("2. Testing prediction...")
    req = SymptomRequest(text="I have itching and skin rash")
    try:
        result = main.predict(req)
        print("Result:", result)
        if result['disease'] == 'Fungal infection' or result['confidence'] > 0:
            print("✅ Verification SUCCESS")
        else:
            print("❌ Verification FAILED (Unexpected result)")
    except Exception as e:
        print(f"Prediction failed: {e}")

if __name__ == "__main__":
    test()
