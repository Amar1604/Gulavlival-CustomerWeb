from app.core.database import engine, Base
from sqlalchemy import text
import app.models

def run_migration():
    print("Running ratings and reviews database migration...")
    with engine.connect() as conn:
        # Update restaurant_settings table
        conn.execute(text("ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS average_rating FLOAT DEFAULT 4.8;"))
        conn.execute(text("ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 128;"))
        
        # Update menu_items table
        conn.execute(text("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;"))
        
        conn.commit()
        print("Updated existing tables schema successfully.")

    # Create missing tables (restaurant_reviews, menu_item_ratings)
    Base.metadata.create_all(bind=engine)
    print("All review tables created and synchronized successfully!")

if __name__ == "__main__":
    run_migration()
