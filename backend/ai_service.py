import requests
import json
import random

# CONFIGURATION
OLLAMA_URL = "http://localhost:11434/api/generate"
USE_MOCK = True # <--- TOGGLE THIS TO FALSE WHEN TEAMMATE IS READY

def get_ai_feedback(score_data):
    """
    Generates feedback based on game performance.
    Input: score_data (dict) -> { "score": 1000, "attention_avg": 85, "level": 3 }
    Output: strict string (The AI response)
    """
    
    if USE_MOCK:
        # --- MOCK IMPLEMENTATION ---
        feedbacks = [
            "Great focus! Your attention was steady throughout the intermediate levels.",
            "Good effort, but your attention drifted during the speed increase. Try to blink less often.",
            "Excellent cognitive endurance! You maintained high focus even with distractions.",
            "Your reaction times are improving, but consistency needs work.",
            "Neuro-pilot engaged successfully. Your brain-computer interface control is promising."
        ]
        return random.choice(feedbacks)
    
    else:
        # --- REAL OLLAMA IMPLEMENTATION ---
        try:
            prompt = f"Analyze this cognitive performance data: Score {score_data['score']}, Attention Average {score_data['attention_avg']}%, Level Reached {score_data['level']}. Provide brief, encouraging feedback in 1 sentence."
            
            payload = {
                "model": "llama3",  # Or whatever model your teammate uses
                "prompt": prompt,
                "stream": False
            }
            
            response = requests.post(OLLAMA_URL, json=payload, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "Analysis complete.")
            else:
                return f"AI Service Error: {response.status_code}"
                
        except Exception as e:
            print(f"Ollama Connection Error: {e}")
            return "AI Analysis unavailable (Check Ollama connection)"
