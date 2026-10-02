from app.core.database import SessionLocal
from sqlalchemy import text

def merge_categories():
    db = SessionLocal()
    mappings = {
        "Burger (बर्गर)": "Burger",
        "Maggi (मैगी)": "Maggi",
        "Chinese (चाईनीज)": "Chinese",
        "Momos (मोमोज)": "Momos",
        "Shakes (शेक)": "Shakes",
        "Tea & Coffee (टी-आईटम)": "Tea & Coffee",
    }

    # 1. First ensure Garlic Bread (ब्रेड) is renamed to Garlic Bread
    db.execute(text("""
        UPDATE categories 
        SET name = 'Garlic Bread', slug = 'garlic-bread' 
        WHERE name LIKE 'Garlic Bread%'
    """))
    db.execute(text("""
        UPDATE menu_items 
        SET category_name = 'Garlic Bread' 
        WHERE category_name LIKE 'Garlic Bread%'
    """))

    for old_name, target_name in mappings.items():
        # Get target category id
        target = db.execute(
            text("SELECT id FROM categories WHERE name = :tname"),
            {"tname": target_name}
        ).fetchone()

        old = db.execute(
            text("SELECT id FROM categories WHERE name = :oname"),
            {"oname": old_name}
        ).fetchone()

        if target and old:
            target_id = target[0]
            old_id = old[0]
            # Update menu items to target category id and name
            db.execute(
                text("""
                    UPDATE menu_items 
                    SET category_id = :tid, category_name = :tname 
                    WHERE category_id = :oid
                """),
                {"tid": target_id, "tname": target_name, "oid": old_id}
            )
            # Delete old category
            db.execute(
                text("DELETE FROM categories WHERE id = :oid"),
                {"oid": old_id}
            )

    db.commit()
    db.close()
    print("Categories successfully unified with SQL!")

if __name__ == "__main__":
    merge_categories()
