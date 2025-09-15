import requests
import json
import spacy
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../..', '.env'))

# Load the spaCy NLP model
# NOTE: You must have run `python -m spacy download en_core_web_sm` to get this model.
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("SpaCy model 'en_core_web_sm' not found. Please run 'python -m spacy download en_core_web_sm'.")
    exit()

# Access the API key and MongoDB URI from environment variables
# This line was corrected to reference the variable name 'NEWS_API_KEY'
API_KEY = os.getenv("NEWS_API_KEY")
MONGO_URI = os.getenv("DATABASE_URL")
API_URL = "https://newsdata.io/api/1/latest"

def fetch_and_process_news():
    """Fetches news data, processes it with NLP, and saves it to MongoDB."""
    try:
        # Check if the API key is available
        if not API_KEY:
            print("NEWS_API_KEY not found in environment variables. Please set it in your .env file.")
            return

        params = {
            'apikey': API_KEY,
            'country': 'in',
            'language': 'en',
            'qInTitle': '"theft" OR "robbery" OR "assault" OR "crime"'
        }

        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        data = response.json()

        # Connect to MongoDB using the URI from the .env file
        client = MongoClient(MONGO_URI)
        db = client.get_database('crime_lens_db')
        collection = db.get_collection('crime_alerts')

        for article in data.get('results', []):
            title = article.get('title', '')
            content = article.get('content', '')
            full_text = title + " " + content

            doc = nlp(full_text)
            locations = [ent.text for ent in doc.ents if ent.label_ == "GPE"]
            crime_types = ['theft', 'robbery', 'assault', 'illegal protest', 'vandalism', 'riots', 'sexual assault']
            
            found_crime = next((c for c in crime_types if c in full_text.lower()), "unknown")
            
            ai_confidence = 1.0 if found_crime != "unknown" else 0.4
            
            processed_data = {
                "crime_type": found_crime,
                "location": locations[0] if locations else "Unknown",
                "published_at": article.get('pubDate'),
                "ai_confidence": ai_confidence,
                "raw_article_title": title,
                "raw_article_url": article.get('link')
            }
            
            collection.insert_one(processed_data)
            print(f"Saved new incident: {found_crime} at {processed_data['location']}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

fetch_and_process_news()