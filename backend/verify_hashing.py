import sys
import os
import asyncio

# Add project root
sys.path.insert(0, os.getcwd())

from core.security import get_password_hash, verify_password

def check_hashing():
    print("Testing password hashing...")
    try:
        secret = "123456"
        hashed = get_password_hash(secret)
        print(f"Hash generated: {hashed}")
        
        is_valid = verify_password(secret, hashed)
        print(f"Verification result: {is_valid}")
        
        if is_valid:
            print("✅ Password hashing works correctly.")
        else:
            print("❌ Password verification failed.")
    except Exception as e:
        print(f"❌ Hashing failed: {e}")

if __name__ == "__main__":
    check_hashing()
