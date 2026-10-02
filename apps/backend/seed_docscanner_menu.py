import uuid
from datetime import datetime, timezone
from app.core.database import SessionLocal
from app.models.menu import Category, MenuItem, MenuVariant

def seed_menu():
    db = SessionLocal()
    print("Seeding restaurant menu items from DocScanner...")

    # Data specification matching DocScanner exactly
    categories_data = [
        {
            "name": "Pizza",
            "sort_order": 1,
            "items": [
                {"name": "Cheesy Pizza (चीजी पिज्जा)", "price": 90, "desc": "Classic melted mozzarella cheese pizza", "veg": True},
                {"name": "Cheesy & Onion (चीजी एण्ड अनियन)", "price": 110, "desc": "Mozzarella cheese with crisp onion", "veg": True},
                {"name": "Cheesy & Corn (चीजी एण्ड कॉर्न)", "price": 120, "desc": "Mozzarella cheese with sweet golden corn", "veg": True},
                {"name": "Cheesy & Capsicum (चीजी एण्ड कैप्सिकम)", "price": 120, "desc": "Mozzarella cheese with fresh green capsicum", "veg": True},
                {"name": "Cheesy & Tomato (चीजी एण्ड टोमैटो)", "price": 120, "desc": "Mozzarella cheese with ripe juicy tomatoes", "veg": True},
                {"name": "Cheesy Onion Paneer (चीजी अनियन पनीर)", "price": 140, "desc": "Melted cheese topped with paneer cubes and crunchy onion", "veg": True},
                {"name": "Cheesy Onion Corn (चीजी अनियन कॉर्न)", "price": 140, "desc": "Mozzarella cheese with sweet corn and diced onions", "veg": True},
                {
                    "name": "Veg Treat (वेज ट्रीट)", "price": 140, "desc": "चीज, अनियन, कैप्सिकम", "veg": True,
                    "variants": [{"name": "Regular", "price": 140}, {"name": "Medium", "price": 260}, {"name": "Large", "price": 350}]
                },
                {
                    "name": "Mexican Delight (मेक्सिकन डिलाइट)", "price": 140, "desc": "चीज, जलापेनो, गोल्डन कॉर्न", "veg": True,
                    "variants": [{"name": "Regular", "price": 140}, {"name": "Medium", "price": 260}, {"name": "Large", "price": 350}]
                },
                {
                    "name": "Spicy Pizza (स्पाईसी पिज्जा)", "price": 180, "desc": "स्पे. चिल्ली गारलीक, अनियन, कैप्सिकम, मशरूम", "veg": True,
                    "variants": [{"name": "Regular", "price": 180}, {"name": "Medium", "price": 330}, {"name": "Large", "price": 450}]
                },
                {
                    "name": "Spicy Paneer (स्पाईसी पनीर)", "price": 180, "desc": "स्पे. चिल्ली गारलीक, अनियन, कैप्सिकम, पनीर", "veg": True,
                    "variants": [{"name": "Regular", "price": 180}, {"name": "Medium", "price": 330}, {"name": "Large", "price": 450}]
                },
                {
                    "name": "Golden Choice (गोल्डन चॉइस)", "price": 180, "desc": "चीज, अनियन, स्वीट कॉर्न, पनीर", "veg": True,
                    "variants": [{"name": "Regular", "price": 180}, {"name": "Medium", "price": 330}, {"name": "Large", "price": 450}]
                },
                {
                    "name": "Mexican Veg Wonder (मेक्सिकम वेज वण्डर)", "price": 180, "desc": "चीज, अनियन, कैप्सिकम, मशरूम, टोमैटो", "veg": True,
                    "variants": [{"name": "Regular", "price": 180}, {"name": "Medium", "price": 330}, {"name": "Large", "price": 450}]
                },
                {
                    "name": "Veggie Lover (वेजी लवर)", "price": 180, "desc": "चीज, अनियन, कैप्सिकम, मशरूम, टोमैटो", "veg": True,
                    "variants": [{"name": "Regular", "price": 180}, {"name": "Medium", "price": 330}, {"name": "Large", "price": 450}]
                },
                {
                    "name": "Paneer Makhani (पनीर मखनी)", "price": 200, "desc": "स्पे. मखनी सॉस, अनियन, कैप्सिकम, पनीर", "veg": True,
                    "variants": [{"name": "Regular", "price": 200}, {"name": "Medium", "price": 370}, {"name": "Large", "price": 550}]
                },
                {
                    "name": "Veggie Delight (वेजी डिलाइट)", "price": 200, "desc": "चीज, अनियन, कैप्सिकम, मशरूम, रेड पेपर, पनीर, विद स्पे. तन्दूरी सॉस", "veg": True,
                    "variants": [{"name": "Regular", "price": 200}, {"name": "Medium", "price": 370}, {"name": "Large", "price": 550}]
                },
                {
                    "name": "Tandoori Paneer (तन्दूरी पनीर)", "price": 200, "desc": "चीज, अनियन, कैप्सिकम, रेड पेपर, पनीर, विद स्पे. तन्दूरी सॉस", "veg": True,
                    "variants": [{"name": "Regular", "price": 200}, {"name": "Medium", "price": 370}, {"name": "Large", "price": 550}]
                },
            ]
        },
        {
            "name": "Garlic Bread (ब्रेड)",
            "sort_order": 2,
            "items": [
                {"name": "Garlic Bread (गारलीक ब्रेड)", "price": 100, "desc": "Crispy buttery garlic bread with herbs", "veg": True},
                {"name": "Stuffed Garlic Bread (स्टफ गारलीक ब्रेड)", "price": 150, "desc": "Cheesy stuffed garlic bread with sweet corn and jalapenos", "veg": True},
            ]
        },
        {
            "name": "Burger (बर्गर)",
            "sort_order": 3,
            "items": [
                {"name": "King Burger (किंग बर्गर)", "price": 60, "desc": "Classic crispy vegetable patty with fresh mayo", "veg": True},
                {"name": "Cheese Paneer Burger (चीज पनीर बर्गर)", "price": 100, "desc": "Crisp golden patty topped with paneer slice and melted cheese", "veg": True},
            ]
        },
        {
            "name": "Maggi (मैगी)",
            "sort_order": 4,
            "items": [
                {
                    "name": "Veg Masala Maggi (वेज मसाला मैगी)", "price": 60, "desc": "Classic spiced noodles tossed with fresh veggies", "veg": True,
                    "variants": [{"name": "Half", "price": 60}, {"name": "Full", "price": 110}]
                },
                {
                    "name": "Corn Maggi (कॉर्न मैगी)", "price": 70, "desc": "Sweet golden corn masala noodles", "veg": True,
                    "variants": [{"name": "Half", "price": 70}, {"name": "Full", "price": 130}]
                },
                {
                    "name": "Cheese Maggi (चीज मैगी)", "price": 90, "desc": "Super cheesy delicious masala noodles", "veg": True,
                    "variants": [{"name": "Half", "price": 90}, {"name": "Full", "price": 150}]
                },
            ]
        },
        {
            "name": "Chinese (चाईनीज)",
            "sort_order": 5,
            "items": [
                {
                    "name": "Chilli Potato (चिल्ली पोटैटो)", "price": 70, "desc": "Crispy potato fingers tossed in spicy sweet chilli sauce", "veg": True,
                    "variants": [{"name": "Half", "price": 70}, {"name": "Full", "price": 130}]
                },
                {"name": "French Fries (फ्रेंच फ्राईस)", "price": 100, "desc": "Golden salted crispy potato fries", "veg": True},
                {
                    "name": "Simple Chowmein (सिम्पल चाऊमीन)", "price": 50, "desc": "Wok-tossed noodles with shredded vegetables", "veg": True,
                    "variants": [{"name": "Half", "price": 50}, {"name": "Full", "price": 90}]
                },
                {
                    "name": "Hakka Noodle (हक्का नूडल)", "price": 80, "desc": "Street style spicy garlic vegetable Hakka noodles", "veg": True,
                    "variants": [{"name": "Half", "price": 80}, {"name": "Full", "price": 150}]
                },
                {
                    "name": "Singapuri Noodle (शिंगापुरी नूडल)", "price": 80, "desc": "Tangy yellow curry noodles with capsicum and cabbage", "veg": True,
                    "variants": [{"name": "Half", "price": 80}, {"name": "Full", "price": 150}]
                },
            ]
        },
        {
            "name": "Momos (मोमोज)",
            "sort_order": 6,
            "items": [
                {
                    "name": "Fried Veg Momos (फ्राई वेज मोमोज)", "price": 60, "desc": "Crispy fried vegetable dumplings with spicy red dip", "veg": True,
                    "variants": [{"name": "Half", "price": 60}, {"name": "Full", "price": 100}]
                },
                {
                    "name": "Paneer Fried Momos (पनीर फ्राई मोमोज)", "price": 70, "desc": "Golden fried paneer stuffed dumplings", "veg": True,
                    "variants": [{"name": "Half", "price": 70}, {"name": "Full", "price": 140}]
                },
                {
                    "name": "Steam Veg Momos (स्टीम वेज मोमोज)", "price": 50, "desc": "Fresh steamed healthy vegetable dumplings", "veg": True,
                    "variants": [{"name": "Half", "price": 50}, {"name": "Full", "price": 90}]
                },
                {
                    "name": "Steam Paneer Momos (स्टीम पनीर मोमोज)", "price": 60, "desc": "Fresh steamed cottage cheese dumplings", "veg": True,
                    "variants": [{"name": "Half", "price": 60}, {"name": "Full", "price": 110}]
                },
            ]
        },
        {
            "name": "Shakes (शेक)",
            "sort_order": 7,
            "items": [
                {"name": "Vanilla Shake (वनीला शेक)", "price": 100, "desc": "Thick creamy vanilla ice cream shake", "veg": True},
                {"name": "Strawberry Shake (स्ट्रॉबेरी शेक)", "price": 100, "desc": "Rich refreshing strawberry shake", "veg": True},
                {"name": "Pineapple Shake (पाईनेप्पल शेक)", "price": 100, "desc": "Sweet chilled pineapple milkshake", "veg": True},
                {"name": "Chocolate Shake (चॉकलेट शेक)", "price": 140, "desc": "Loaded Belgian chocolate thick shake", "veg": True},
                {"name": "Butterscotch Shake (बटरस्कॉच शेक)", "price": 100, "desc": "Crunchy caramel butterscotch shake", "veg": True},
            ]
        },
        {
            "name": "Tea & Coffee (टी-आईटम)",
            "sort_order": 8,
            "items": [
                {"name": "Chai / Tea (चाय)", "price": 20, "desc": "Hot aromatic milk tea", "veg": True},
                {"name": "Hot Coffee (कॉफी)", "price": 40, "desc": "Rich freshly brewed hot coffee", "veg": True},
                {"name": "Kulhad Chai (कुल्हड़ चाय)", "price": 30, "desc": "Clay-pot tandoori cardamom milk tea", "veg": True},
                {"name": "Cold Coffee (कोल्ड कॉफी)", "price": 100, "desc": "Chilled frothy chocolate cold coffee", "veg": True},
            ]
        },
    ]

    total_inserted = 0

    for cat_data in categories_data:
        # Check or create category
        cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not cat:
            cat = Category(
                id=str(uuid.uuid4()),
                name=cat_data["name"],
                slug=cat_data["name"].lower().replace(" ", "-").replace("(", "").replace(")", ""),
                sort_order=cat_data["sort_order"],
            )
            db.add(cat)
            db.flush()

        for item_data in cat_data["items"]:
            # Check if dish exists
            item = db.query(MenuItem).filter(MenuItem.name == item_data["name"]).first()
            if not item:
                item = MenuItem(
                    id=str(uuid.uuid4()),
                    category_id=cat.id,
                    category_name=cat.name,
                    name=item_data["name"],
                    slug=item_data["name"].lower().replace(" ", "-").replace("(", "").replace(")", "").replace("/", "-"),
                    description=item_data.get("desc"),
                    base_price=float(item_data["price"]),
                    veg=item_data.get("veg", True),
                    is_veg=item_data.get("veg", True),
                    is_available=True,
                    is_bestseller=False,
                    popular=False,
                    created_at=datetime.now(timezone.utc),
                )
                db.add(item)
                db.flush()
                total_inserted += 1

                # Add variants if any (Regular, Medium, Large, Half, Full)
                if "variants" in item_data:
                    for v_data in item_data["variants"]:
                        variant = MenuVariant(
                            id=str(uuid.uuid4()),
                            menu_item_id=item.id,
                            name=v_data["name"],
                            price=float(v_data["price"]),
                            is_available=True,
                        )
                        db.add(variant)

    db.commit()
    db.close()
    print(f"Successfully seeded {total_inserted} dishes into the restaurant database!")

if __name__ == "__main__":
    seed_menu()
