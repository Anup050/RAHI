import urllib.request
try:
    print("Checking...")
    with urllib.request.urlopen("http://localhost:8001/", timeout=2) as r:
        print(f"Status: {r.getcode()}")
        with open("final_verify.txt", "w") as f: f.write("SUCCESS 200")
except Exception as e:
    print(f"Error: {e}")
    with open("final_verify.txt", "w") as f: f.write(str(e))
