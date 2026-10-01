"""
Quick Database Connectivity Verification Script
Checks connection to PostgreSQL at localhost:5432 with provided credentials.
"""
import sys
import os

try:
    import psycopg2
except ImportError:
    print("psycopg2 is not installed in the current Python environment.")
    print("Testing via standard socket check instead...")
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(3)
    try:
        s.connect(("127.0.0.1", 5432))
        print("SUCCESS: PostgreSQL port 5432 is open and accepting TCP connections on localhost!")
        s.close()
    except Exception as e:
        print(f"FAILED: Cannot reach port 5432 on localhost: {e}")
        print("Make sure PostgreSQL is running (either locally or via docker-compose up postgres -d).")
    sys.exit(0)

# If psycopg2 is available, test authentication and database presence
password = os.environ.get("POSTGRES_PASSWORD", "postgres")
user = os.environ.get("POSTGRES_USER", "postgres")
host = os.environ.get("POSTGRES_HOST", "localhost")
port = os.environ.get("POSTGRES_PORT", "5432")
dbname = os.environ.get("POSTGRES_DB", "gulavlival_grand")

print(f"Attempting connection to PostgreSQL server at {host}:{port} as user '{user}'...")

# First check if PostgreSQL server is accepting connections (connecting to default 'postgres' db)
try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname="postgres",
        connect_timeout=5
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT version();")
    ver = cur.fetchone()[0]
    print(f"SUCCESS: Connected to PostgreSQL server!")
    print(f"Version: {ver}")

    # Check if 'gulavlival_grand' database exists, if not create it
    cur.execute(f"SELECT 1 FROM pg_database WHERE datname = '{dbname}';")
    exists = cur.fetchone()
    if not exists:
        print(f"Database '{dbname}' does not exist yet. Creating it now...")
        cur.execute(f"CREATE DATABASE {dbname};")
        print(f"Database '{dbname}' created successfully!")
    else:
        print(f"Database '{dbname}' already exists.")

    cur.close()
    conn.close()

    # Now verify connection directly to target database
    target_conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname=dbname,
        connect_timeout=5
    )
    print(f"SUCCESS: Fully connected to target database '{dbname}' with password authentication!")
    target_conn.close()
    print("STATUS: ONLINE AND READY.")
except psycopg2.OperationalError as e:
    print(f"CONNECTION ERROR: {e}")
except Exception as e:
    print(f"UNEXPECTED ERROR: {e}")
