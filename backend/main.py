from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

import models, database, ai_service

# --- DATABASE SETUP ---
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="LockFocus Access API")

# --- CORS SETUP (Allow Frontend) ---
origins = [
    "http://localhost:5173",  # React Native/Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC SCHEMAS (Validation) ---
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class ScoreCreate(BaseModel):
    user_id: int
    score_value: int
    game_name: str = "FocusFlow"
    level_reached: int = 0
    attention_avg: float = 0.0
    details: dict = {}

# --- API ROUTES ---

@app.get("/")
def read_root():
    return {"status": "online", "service": "LockFocus Backend"}

# 1. REGISTER
@app.post("/api/register")
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # In production, hash this password! For hackathon, plain text is risky but fast.
    # We will use simple storing for now to ensure it works.
    new_user = models.User(
        email=user.email, 
        hashed_password=user.password, # TODO: Add bcrypt
        full_name=user.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email, "message": "User created successfully"}

# 2. LOGIN
@app.post("/api/login")
def login(user: UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or db_user.hashed_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "user_id": db_user.id, 
        "full_name": db_user.full_name, 
        "email": db_user.email,
        "token": "fake-jwt-token-for-hackathon" 
    }

# 3. SUBMIT SCORE (With AI Feedback)
@app.post("/api/score")
def submit_score(score: ScoreCreate, db: Session = Depends(database.get_db)):
    # 1. Generate AI Feedback
    ai_feedback = ai_service.get_ai_feedback({
        "score": score.score_value,
        "attention_avg": score.attention_avg,
        "level": score.level_reached,
        "game": score.game_name
    })
    
    import json
    
    # 2. Save to DB
    new_score = models.Score(
        user_id=score.user_id,
        score_value=score.score_value,
        game_name=score.game_name,
        level_reached=score.level_reached,
        attention_avg=score.attention_avg,
        neural_feedback=ai_feedback,
        details=json.dumps(score.details) if score.details else None
    )
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    
    return {
        "status": "saved",
        "ai_feedback": ai_feedback,
        "score_id": new_score.id
    }

# 4. LEADERBOARD
@app.get("/api/leaderboard")
def get_leaderboard(db: Session = Depends(database.get_db)):
    # Get top 10 scores
    top_scores = db.query(models.Score).order_by(models.Score.score_value.desc()).limit(10).all()
    
    # Enrich with user names
    results = []
    for s in top_scores:
        user = s.user
        results.append({
            "name": user.full_name if user else "Unknown",
            "score": s.score_value,
            "game": s.game_name,
            "level": s.level_reached
        })
        
    return results
