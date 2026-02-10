from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to scores
    scores = relationship("Score", back_populates="user")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    score_value = Column(Integer)
    game_name = Column(String, index=True, default="FocusFlow")
    level_reached = Column(Integer, nullable=True)
    attention_avg = Column(Float, nullable=True)  # Percentage (0-100)
    neural_feedback = Column(String, nullable=True) # AI Analysis text
    details = Column(String, nullable=True) # JSON string for extra game-specific stats
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="scores")
