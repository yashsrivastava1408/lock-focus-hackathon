
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import random
from passlib.context import CryptContext
import os

# --- PASSWORD HASHING ---
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_data():
    # 1. CLEAN SLATE: Drop all tables to ensure no plain text passwords remain
    print("WARNING: Dropping all tables to ensure clean slate with hashed passwords...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    users = [
        {"full_name": "Arnav", "email": "arnav@focus.ai"},
        {"full_name": "Vanshika", "email": "vanshika@focus.ai"},
        {"full_name": "Shivangi", "email": "shivangi@focus.ai"},
        {"full_name": "Priyam", "email": "priyam@focus.ai"},
        {"full_name": "Yug", "email": "yug@focus.ai"},
    ]
    
    hashed_pwd = get_password_hash("password123") # Hash once for efficiency
    
    for user_data in users:
        print(f"Creating user: {user_data['full_name']}")
        db_user = models.User(
            email=user_data["email"],
            full_name=user_data["full_name"],
            hashed_password=hashed_pwd
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
            
        # Add some scores
        print(f"Adding scores for {user_data['full_name']}")
        for i in range(random.randint(2, 5)):
            score = models.Score(
                user_id=db_user.id,
                score_value=random.randint(1500, 8500),
                game_name="FocusFlow",
                level_reached=random.randint(3, 12),
                attention_avg=random.uniform(65.0, 98.0),
                neural_feedback=f"Demo feedback {i}"
            )
            db.add(score)
        db.commit()

    print("Seeding complete! Leaderboard populated with HASHED passwords.")
    db.close()

if __name__ == "__main__":
    seed_data()
