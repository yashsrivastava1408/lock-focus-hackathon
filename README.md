# Lock Focus
> **An Intent-Aware, Adaptive Cognitive Ecosystem** (Cross-platform: Web & Mobile)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: 3rd Place @ HackElite'26](https://img.shields.io/badge/Status-3rd%20Place%20%40%20HackElite'26-gold)](https://github.com/yashsrivastava1408/lock-focus-hackathon)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Expo%20%7C%20MediaPipe-green)](https://reactjs.org/)

**Lock Focus** is a privacy-first web & mobile platform designed to assess, track, and improve cognitive focus through adaptive AI and gamified neuro-feedback. It bridges the gap between static content and neurodiverse needs (ADHD/Dyslexia) using real-time attention signals.

---

## 🧠 The Problem vs. Solution

### The "Attention Gap"
Modern interfaces are rigid. They don’t know if you’re focused, distracted, or struggling. For users with **ADHD** or **Dyslexia**, this rigidity creates barriers:
*   **ADHD**: Drifting attention leads to missed information.
*   **Dyslexia**: Walls of text cause visual crowding and fatigue.

### Our Solution: "Intent-Aware" Computing
**Lock Focus** isn't just a tool; it's an **active participant**.
*   **Active Sensing**: Perceives attention state using privacy-first, local AI (Gaze Tracking).
*   **Reactive Adaptation**: Modifies content in real-time based on focus.
*   **Gamified Training**: Strengthens cognitive muscles through clinically-inspired loops.

---

## 🚀 Key Features

### 1. Neuro-Pilot (Focus Flow)
A high-intensity flow trainer that uses the Gaze Sensing engine for input.
*   **Gaze-Steered Gameplay**: The ship navigates based on your eye movement.
*   **Focus-Locked Progression**: The game pauses instantly if you look away.
*   **Neuro-Analytics**: detailed reports on attention span and reaction latency.

### 2. PeriQuest (Peripheral Vision Training) **[NEW]**
A dynamic reaction game designed to expand visual awareness.
*   **Central Fixation**: Users must keep eyes locked on the center.
*   **Peripheral Targets**: Detect and react to shapes appearing in the peripheral field.
*   **Heatmap Analysis**: Tracks "blind spots" and reaction speeds across the visual field.

### 3. ADHD Support Companion **[NEW]**
An AI-powered chatbot for executive function management.
*   **Task Breakdown**: Deconstructs overwhelming tasks into manageable steps.
*   **Prioritization**: Helps users organize their day based on energy levels.
*   **Coping Strategies**: Provides immediate, actionable advice for focus and emotional regulation.

### 4. Adaptive Reader & OCR
A reading environment that proactively responds to attention.
*   **Focus Dimming**: Text dims when you look away to save your place.
*   **Dyslexia Mode**: OpenDyslexic font and increased line spacing.
*   **Vision Stress Mode**: Reduces contrast and visual noise.

### 5. Vision Studio
Simulates neurodivergent experiences to foster empathy and understanding.
*   **ADHD Simulator**: Visualizes distraction and sensory overload.
*   **Dyslexia Simulator**: Demonstrates letter dancing and crowding.

### 6. 📱 Mobile Companion (iOS & Android)
Take your cognitive training on the go with our fully synchronized mobile app.
*   **Integrated Games**: Play **Focus Flow**, **Zen Drive**, **Balloon Pop**, and **Color Match** anywhere.
*   **Cross-Platform Sync**: All session data syncs instantly with your web dashboard.
*   **Tactile Training**: Exclusive touch-based cognitive exercises for fine motor control and reaction time.

---

## 🏗️ System Architecture

The ecosystem employs a **Zero-Trust** hybrid architecture. Sensitive cognitive data is processed locally, while persistent records are secured with military-grade encryption.

```mermaid
flowchart TB
    subgraph Client ["Client Layer (Web & Mobile)"]
        direction TB
        UI[["React / Expo UI"]]
        Logic{"Game & App Logic"}
        AI(("MediaPipe AI<br/>(Local Vision)"))
    end

    subgraph Server ["Secure Backend Layer"]
        API["FastAPI / Express API"]
        Vault[("AES-256 Encrypted Vault<br/>(Chat History & Sessions)")]
        LLM(("Ollama / Llama 3<br/>(AI Companion)"))
    end

    style Client fill:#0a0f1d,stroke:#1e293b,stroke-width:2px,color:#fff
    style Server fill:#1e1e24,stroke:#6366f1,stroke-width:2px,color:#fff
    style UI fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Logic fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
    style AI fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#fff
    style Vault fill:#1e293b,stroke:#ef4444,stroke-width:2px,color:#fff
    style LLM fill:#1e293b,stroke:#ec4899,stroke-width:2px,color:#fff

    UI -->|User/Touch Events| Logic
    Logic -->|State Updates| UI
    Logic -->|Inference Request| AI
    AI -->|Gaze & Face Landmarks| Logic
    Logic <-->|Sync Encrypted Data| API
    API <-->|Read/Write| Vault
    API <-->|Context-Aware Query| LLM
```

## 🔄 Data Flow Pipeline

A privacy-first pipeline where real-time video processing remains local, while session data and chat history are securely persisted.

```mermaid
sequenceDiagram
    autonumber
    participant Cam as 📷 Camera Feed
    participant MP as 🧠 MediaPipe (Local)
    participant Engine as ⚙️ Gaze Engine
    participant App as 🎮 App Logic
    participant API as ☁️ Backend API
    participant DB as 🔒 AES-256 Store
    
    Note over Cam, Engine: 🔒 Local-Only Processing (No Video Streamed)
    
    Cam->>MP: Raw Video Frame (60fps)
    activate MP
    MP->>Engine: 478 Face Landmarks + Iris Data
    deactivate MP
    
    activate Engine
    Engine->>Engine: Calculate Gaze Vector & Attention
    Engine->>App: Gaze Coordinates (x, y)
    deactivate Engine
    
    activate App
    alt Focus Flow
        App->>App: Update Physics / Game State
    end
    
    Note over App, DB: ☁️ Secure Persistence
    
    App->>API: POST /api/session/save (JSON)
    activate API
    API->>API: Encrypt Payload (AES-256-CBC)
    API->>DB: Write Encrypted Blob
    API-->>App: Confirmation
    deactivate API
    deactivate App
```

---

## 🛠️ Tech Stack

*   **Frontend (Web)**: React 18, Vite, Tailwind CSS, Framer Motion
*   **Frontend (Mobile)**: React Native, Expo, NativeWind
*   **AI/ML (Vision)**: MediaPipe (@mediapipe/tasks-vision) - *Running Locally*
*   **AI/ML (Language)**: Ollama (Llama 3) - *Local Inference*
*   **Backend**: Node.js (Express) & Python (FastAPI)
*   **Database**: SQLite (SQLAlchemy / sqlite3)
*   **Security**: **AES-256-CBC Encryption** for all at-rest user data
*   **Visualization**: Recharts, Canvas API
*   **Icons**: Lucide React

---

## 🔒 Privacy & Ethics

Lock Focus is built with **Privacy-by-Design**:
*   **Hybrid Architecture**: Heavy computer vision runs **locally** in the browser to ensure no video feeds ever leave your device.
*   **Military-Grade Encryption**: All chat history and user sessions are stored using **AES-256-CBC** encryption. Even if the database is compromised, the data remains unreadable.
*   **Secure Data**: Only abstract data (scores, session durations, text logs) is sent to the backend for persistence.
*   **Opt-in Only**: Camera access is explicitly requested per session.

---

## 🏁 Getting Started

### Prerequisites
*   Node.js (v16+)
*   npm or yarn

### Installation (Web)

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yashsrivastava1408/lock-focus-hackathon.git
    cd lock-focus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` to start using Lock Focus.

### Installation (Mobile)

1.  **Navigate to mobile directory**
    ```bash
    cd mobile
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the Expo server**
    ```bash
    npx expo start
    ```

4.  **Run on Device**
    Scan the QR code with the Expo Go app (Android/iOS).

---

## 👥 Contributors

*   **[Yash Srivastava](https://github.com/yashsrivastava1408)** - *Lead Developer & System Architect*
    *   **AI & Vision Engine**: Integrated MediaPipe for real-time, privacy-first gaze tracking and attention analysis.
    *   **Mobile Development**: Engineered the cross-platform mobile companion app using React Native & Expo.
    *   **Security Infrastructure**: Implemented military-grade AES-256 encryption for local data persistence and secure chat storage.
    *   **Performance Engineering**: Optimized application performance through code-splitting, lazy loading, and efficient re-rendering strategies.
    *   **Full Stack Integration**: Orchestrated the hybrid Node.js/FastAPI backend and ensured seamless data synchronization.
*   **[Team Members]** - *Frontend & Design*

---

*Built with ❤️ for the future of accessible computing.*
