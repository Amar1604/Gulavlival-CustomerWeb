"""
Menu Seed Script for Gulavlival Grand
Populates the 7 mandatory categories and signature items.
Run: python scripts/seed_menu.py
"""
import sys
import os
from decimal import Decimal

# Add apps/backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "backend")))

from app.core.database import SessionLocal, Base, engine
from app.models.menu import Category, MenuItem, MenuVariant, AddOn
import app.models

def seed():
    print("Connecting to database and verifying schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Category).first():
            print("Categories already exist. Skipping seed to prevent duplication.")
            return

        print("Seeding Gulavlival Grand 7 core menu categories...")
        categories_data = [
            {
                "name": "Pizza",
                "slug": "pizza",
                "sort_order": 1,
                "description": "Wood-fired artisanal stone-baked pizzas with rich mozzarella",
                "items": [
                    {
                        "name": "Margherita Classica",
                        "slug": "margherita-classica",
                        "description": "San Marzano tomato sauce, fresh basil, bocconcini mozzarella, extra virgin olive oil.",
                        "base_price": Decimal("249.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Regular (8\")", "price": Decimal("249.00")},
                            {"name": "Medium (10\")", "price": Decimal("399.00")},
                            {"name": "Large (12\")", "price": Decimal("549.00")}
                        ],
                        "add_ons": [
                            {"name": "Extra Mozzarella Cheese", "price": Decimal("49.00")},
                            {"name": "Cheese Stuffed Crust", "price": Decimal("69.00")},
                            {"name": "Jalapeño & Olives", "price": Decimal("39.00")}
                        ]
                    },
                    {
                        "name": "Paneer Tikka Supreme",
                        "slug": "paneer-tikka-supreme",
                        "description": "Tandoori marinated paneer cubes, crisp capsicum, charred red onions & creamy tikka drizzle.",
                        "base_price": Decimal("299.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Regular (8\")", "price": Decimal("299.00")},
                            {"name": "Medium (10\")", "price": Decimal("469.00")},
                            {"name": "Large (12\")", "price": Decimal("629.00")}
                        ],
                        "add_ons": [
                            {"name": "Extra Mozzarella Cheese", "price": Decimal("49.00")},
                            {"name": "Peri Peri Seasoning", "price": Decimal("20.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Burger",
                "slug": "burger",
                "sort_order": 2,
                "description": "Juicy artisanal gourmet burgers served in butter-toasted brioche buns",
                "items": [
                    {
                        "name": "Grand Veg Crunch Burger",
                        "slug": "grand-veg-crunch-burger",
                        "description": "Crispy golden herb potato patty, iceberg lettuce, melted cheddar slice, house signature sauce.",
                        "base_price": Decimal("149.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Single Patty", "price": Decimal("149.00")},
                            {"name": "Double Trouble Patty", "price": Decimal("219.00")}
                        ],
                        "add_ons": [
                            {"name": "Cheese Slice", "price": Decimal("25.00")},
                            {"name": "French Fries Combo", "price": Decimal("69.00")}
                        ]
                    },
                    {
                        "name": "Spicy Paneer Royale Burger",
                        "slug": "spicy-paneer-royale-burger",
                        "description": "Panko crusted thick paneer slab tossed in hot paprika glaze with gherkins and chipotle mayo.",
                        "base_price": Decimal("189.00"),
                        "is_veg": True,
                        "is_bestseller": False,
                        "variants": [
                            {"name": "Standard", "price": Decimal("189.00")}
                        ],
                        "add_ons": [
                            {"name": "Extra Cheese Melt", "price": Decimal("30.00")},
                            {"name": "Peri Peri Dip", "price": Decimal("25.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Maggi",
                "slug": "maggi",
                "sort_order": 3,
                "description": "Comfort bowls prepared with special house spices and rich butter",
                "items": [
                    {
                        "name": "Cheese Butter Masala Maggi",
                        "slug": "cheese-butter-masala-maggi",
                        "description": "Double Maggi noodles simmered with roasted butter, bell peppers, sweet corn and mountain cheese.",
                        "base_price": Decimal("119.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [],
                        "add_ons": [
                            {"name": "Extra Grated Cheese", "price": Decimal("30.00")},
                            {"name": "Sautéed Mushrooms", "price": Decimal("35.00")}
                        ]
                    },
                    {
                        "name": "Schezwan Veg Blast Maggi",
                        "slug": "schezwan-veg-blast-maggi",
                        "description": "Fiery wok-tossed noodles with homemade schezwan chutney, spring onions and crunchy carrots.",
                        "base_price": Decimal("99.00"),
                        "is_veg": True,
                        "is_bestseller": False,
                        "variants": [],
                        "add_ons": [
                            {"name": "Butter Dollop", "price": Decimal("15.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Chinese",
                "slug": "chinese",
                "sort_order": 4,
                "description": "Wok-tossed aromatic noodles, fried rice, and sizzling Indo-Chinese appetizers",
                "items": [
                    {
                        "name": "Veg Hakka Noodles",
                        "slug": "veg-hakka-noodles",
                        "description": "Freshly pulled noodles tossed in a superheated wok with julienned cabbage, capsicum and light soy.",
                        "base_price": Decimal("169.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Half Portion", "price": Decimal("119.00")},
                            {"name": "Full Portion", "price": Decimal("169.00")}
                        ],
                        "add_ons": [
                            {"name": "Schezwan Dip", "price": Decimal("25.00")}
                        ]
                    },
                    {
                        "name": "Crispy Chilli Paneer (Dry)",
                        "slug": "crispy-chilli-paneer-dry",
                        "description": "Wok-seared cottage cheese cubes tossed with garlic, green chillies, spring onions and dark soy.",
                        "base_price": Decimal("229.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [],
                        "add_ons": [
                            {"name": "Extra Gravy", "price": Decimal("40.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Momos",
                "slug": "momos",
                "sort_order": 5,
                "description": "Steamed and crispy Himalayan dumplings served with spicy garlic dip",
                "items": [
                    {
                        "name": "Steamed Veg Himalayan Momos (6 pcs)",
                        "slug": "steamed-veg-himalayan-momos",
                        "description": "Finely minced mountain veggies and herbs encased in paper-thin translucent dough.",
                        "base_price": Decimal("129.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Steamed (6 Pcs)", "price": Decimal("129.00")},
                            {"name": "Pan Fried (6 Pcs)", "price": Decimal("149.00")},
                            {"name": "Kurkure Fried (6 Pcs)", "price": Decimal("169.00")}
                        ],
                        "add_ons": [
                            {"name": "Spicy Red Chilli Garlic Dip", "price": Decimal("15.00")},
                            {"name": "Tandoori Mayo", "price": Decimal("20.00")}
                        ]
                    },
                    {
                        "name": "Paneer Tikka Momos (6 pcs)",
                        "slug": "paneer-tikka-momos",
                        "description": "Succulent spiced paneer filling charred with roasted aromatics.",
                        "base_price": Decimal("149.00"),
                        "is_veg": True,
                        "is_bestseller": False,
                        "variants": [
                            {"name": "Steamed (6 Pcs)", "price": Decimal("149.00")},
                            {"name": "Kurkure Fried (6 Pcs)", "price": Decimal("189.00")}
                        ],
                        "add_ons": [
                            {"name": "Cheese Mayo", "price": Decimal("25.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Shakes",
                "slug": "shakes",
                "sort_order": 6,
                "description": "Thick ice-cream blended signature shakes and fruit delights",
                "items": [
                    {
                        "name": "Belgian Dark Chocolate Shake",
                        "slug": "belgian-dark-chocolate-shake",
                        "description": "Rich 70% dark Belgian cocoa blended with whole milk and dairy ice cream, topped with cocoa curls.",
                        "base_price": Decimal("169.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Regular (300ml)", "price": Decimal("169.00")},
                            {"name": "Grand Monster (500ml)", "price": Decimal("229.00")}
                        ],
                        "add_ons": [
                            {"name": "Vanilla Ice Cream Scoop", "price": Decimal("35.00")},
                            {"name": "Chocolate Drizzle & Sprinkles", "price": Decimal("20.00")}
                        ]
                    },
                    {
                        "name": "Oreo Hazelnut Thickshake",
                        "slug": "oreo-hazelnut-thickshake",
                        "description": "Crushed Oreo cookies, roasted hazelnut spread, and vanilla cream froth.",
                        "base_price": Decimal("179.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [],
                        "add_ons": [
                            {"name": "Whipped Cream Topping", "price": Decimal("30.00")}
                        ]
                    }
                ]
            },
            {
                "name": "Tea & Coffee",
                "slug": "tea-coffee",
                "sort_order": 7,
                "description": "Freshly brewed artisanal teas, kulhad chai, and espresso coffees",
                "items": [
                    {
                        "name": "Gulavlival Special Masala Chai",
                        "slug": "gulavlival-special-masala-chai",
                        "description": "Steaming clay-pot (Kulhad) tea infused with crushed green cardamom, ginger, cloves and cinnamon.",
                        "base_price": Decimal("49.00"),
                        "is_veg": True,
                        "is_bestseller": True,
                        "variants": [
                            {"name": "Single Kulhad", "price": Decimal("49.00")},
                            {"name": "Flask (Serves 4)", "price": Decimal("169.00")}
                        ],
                        "add_ons": [
                            {"name": "Extra Adrak / Ginger", "price": Decimal("10.00")}
                        ]
                    },
                    {
                        "name": "Café Cappuccino",
                        "slug": "cafe-cappuccino",
                        "description": "Double espresso shot topped with velvety steamed milk foam and Dutch cocoa dusting.",
                        "base_price": Decimal("119.00"),
                        "is_veg": True,
                        "is_bestseller": False,
                        "variants": [
                            {"name": "Single Shot", "price": Decimal("119.00")},
                            {"name": "Double Shot (Strong)", "price": Decimal("149.00")}
                        ],
                        "add_ons": [
                            {"name": "Caramel Syrup Drizzle", "price": Decimal("25.00")}
                        ]
                    }
                ]
            }
        ]

        for cat_data in categories_data:
            items_data = cat_data.pop("items")
            category = Category(**cat_data)
            db.add(category)
            db.flush()

            for item_data in items_data:
                variants_data = item_data.pop("variants", [])
                addons_data = item_data.pop("add_ons", [])
                
                menu_item = MenuItem(category_id=category.id, **item_data)
                db.add(menu_item)
                db.flush()

                for v in variants_data:
                    variant = MenuVariant(menu_item_id=menu_item.id, **v)
                    db.add(variant)

                for a in addons_data:
                    addon = AddOn(menu_item_id=menu_item.id, **a)
                    db.add(addon)

        db.commit()
        print("Menu seeded successfully with 7 categories and signature dishes!")
    except Exception as e:
        db.rollback()
        print(f"Error during menu seed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
