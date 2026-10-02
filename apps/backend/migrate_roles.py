from app.core.database import engine, Base
from sqlalchemy import text
import app.models

def run_migration():
    print("Running database migrations...")
    with engine.connect() as conn:
        # Add role column if not exists
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'CUSTOMER';"))
        
        # Make password_hash nullable for passwordless OTP staff accounts
        conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;"))
        
        conn.commit()
        print("Updated 'users' table schema successfully.")

    # Create any missing tables (restaurant_settings, cash_records, menu_price_history)
    Base.metadata.create_all(bind=engine)
    print("All tables checked and synchronized successfully!")

if __name__ == "__main__":
    run_migration()
