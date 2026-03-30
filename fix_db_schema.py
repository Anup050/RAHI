import asyncio
import os
import sys

# Ensure backend module can be found
current_dir = os.getcwd()
sys.path.append(current_dir)
print(f"Working directory: {current_dir}")

# Attempt imports
try:
    from sqlalchemy import text
    from backend.db.session import engine
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)

async def run_migration():
    with open("migration_log.txt", "w", encoding="utf-8") as f:
        f.write("Starting migration...\n")
        try:
            async with engine.begin() as conn:
                f.write("Checking/Adding 'age' column...\n")
                # We use text() for raw SQL
                await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;"))
                f.write("SUCCESS: Command executed: ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;\n")
        except Exception as e:
            f.write(f"Migration ERROR: {e}\n")

if __name__ == "__main__":
    try:
        # Use python's asyncio
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        asyncio.run(run_migration())
    except Exception as e:
        print(f"Main Execution Error: {e}")
