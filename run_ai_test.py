import sys
import os
import uvicorn

# Set paths
base_dir = os.path.dirname(os.path.abspath(__file__))
ai_engine_dir = os.path.join(base_dir, "ai-engine")
log_file = os.path.join(base_dir, "ai_engine_run_log.txt")

sys.path.append(ai_engine_dir)

print(f"Check log file at: {log_file}")

with open(log_file, "w") as f:
    f.write("Starting AI Engine verification...\n")
    f.write(f"Base dir: {base_dir}\n")
    f.write(f"AI Engine dir: {ai_engine_dir}\n")
    
    try:
        # Check imports
        f.write("Attempting to import app from main...\n")
        try:
            from main import app
            f.write("Successfully imported app.\n")
        except ImportError as e:
            f.write(f"ImportError: {e}\n")
            # Try to see what's in the dir
            f.write(f"Dir contents: {os.listdir(ai_engine_dir)}\n")
            raise

        f.write("Starting uvicorn on port 8002...\n")
        f.flush()
        
        # Run uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8002)
        
    except Exception as e:
        f.write(f"Fatal error: {e}\n")
