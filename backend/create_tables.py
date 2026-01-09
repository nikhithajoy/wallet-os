# create_tables.py

from app.db.session import engine
from app.db.models import Base


def create_tables(drop_existing=False):
    """Create all database tables"""
    if drop_existing:
        print("🗑️  Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully.")


if __name__ == "__main__":
    import sys
    drop = "--drop" in sys.argv or "-d" in sys.argv
    if drop:
        print("⚠️  WARNING: This will delete all existing data!")
    create_tables(drop_existing=drop)
