import asyncio
from sqlalchemy import text
from db.session import engine

async def check_columns():
    try:
        async with engine.connect() as conn:
            # Postgres specific query to list columns
            result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"))
            columns = [row[0] for row in result.fetchall()]
            print(f"Columns in users table: {columns}")
            if 'age' in columns:
                print("SUCCESS: 'age' column found.")
            else:
                print("FAILURE: 'age' column NOT found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    import os
    sys.path.append(os.getcwd())
    asyncio.run(check_columns())
