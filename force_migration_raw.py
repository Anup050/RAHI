import asyncio
import asyncpg

async def run():
    print("Connecting to DB...")
    try:
        # Using credentials from .env
        conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/rahi')
        print("Connected.")
        
        print("Adding age column...")
        try:
            await conn.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;")
            print("SUCCESS: ALTER TABLE executed.")
        except Exception as e:
            print(f"SQL Error: {e}")
        finally:
            await conn.close()
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(run())
