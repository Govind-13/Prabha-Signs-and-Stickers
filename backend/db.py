import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv('MONGO_URI')
if not mongo_uri:
    print("Warning: MONGO_URI environment variable is missing!")
    client = None
    db = None
else:
    try:
        client = MongoClient(mongo_uri)
        # get_default_database extracts the database name directly from the URI (e.g. 'prabha-stickers')
        db = client.get_default_database(default='prabha-stickers')
        print(f"MongoDB Connected successfully to database: {db.name}")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        client = None
        db = None

def serialize_doc(doc):
    """
    Recursively converts MongoDB documents into JSON-serializable dictionaries.
    Converts ObjectId to string representation.
    Converts datetime objects to UTC ISO-8601 formatting (with 'Z' suffix) to match Mongoose timestamps.
    """
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat() + 'Z'
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            serialized[key] = [serialize_doc(v) if isinstance(v, (dict, ObjectId, datetime)) else v for v in value]
        else:
            serialized[key] = value
    return serialized
