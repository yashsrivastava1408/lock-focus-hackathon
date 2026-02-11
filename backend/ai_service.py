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

def get_chat_response(message, history=[]):
    """
    Generates a chat response.
    Input: message (str), history (list)
    Output: dict { "response": str, "action": str, "tasks": list }
    """
    
    if USE_MOCK:
        # --- MOCK CHAT IMPLEMENTATION (FOR DEMO) ---
        # Simulates intelligent responses without risking local LLM failure
        
        lower_msg = message.lower()
        
        if "task" in lower_msg or "do" in lower_msg or "list" in lower_msg:
             return {
                "response": "I can help with that! verified that your task list is getting long. Let's break it down. based on your energy levels, maybe start with the easiest one?",
                "action": "suggest_breakdown",
                "tasks": [
                    {"id": random.randint(1000,9999), "text": "Review project requirements", "completed": False, "priority": "high"},
                    {"id": random.randint(1000,9999), "text": "Draft initial outline", "completed": False, "priority": "medium"}
                ]
            }
        
        elif "tired" in lower_msg or "burnout" in lower_msg:
             return {
                "response": "I hear you. detailed analysis of your gaze patterns suggests fatigue. 85% chance of burnout if you continue. Recommend a 5-minute NSDR (Non-Sleep Deep Rest) session.",
                "action": "suggest_rest",
                "tasks": []
            }
            
        else:
            generic_responses = [
                "I understand. How does that make you feel regarding your current focus goals?",
                "That's interesting. I've logged this in your session history. shall we try a focus sprint?",
                "Noted. Remember, consistency is key for neuroplasticity. You're doing great.",
                "Let's align this with your daily objectives. What's the one thing you want to achieve right now?"
            ]
            return {
                "response": random.choice(generic_responses),
                "action": "none",
                "tasks": []
            }

    else:
        # --- REAL OLLAMA CHAT IMPLEMENTATION ---
        # Ensure 'ollama serve' is running with 'llama3' model
        try:
            # Construct context from history
            context_str = "\\n".join([f"{'User' if msg['isUser'] else 'AI'}: {msg['text']}" for msg in history[-5:]])
            prompt = f"System: You are an empathetic ADHD assistant. Be concise.\\nContext:\\n{context_str}\\nUser: {message}\\nAI:"
            
            payload = {
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
            
            response = requests.post(OLLAMA_URL, json=payload, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                ai_text = result.get("response", "I'm listening.")
                return {
                    "response": ai_text,
                    "action": "none",
                    "tasks": [] # Real LLM task parsing would go here
                }
            else:
                 return { "response": f"Error: {response.status_code}", "action": "error" }
                 
        except Exception as e:
            print(f"Ollama Error: {e}")
            return { "response": "I'm having trouble connecting to my neural engine. Is Ollama running?", "action": "error" }
