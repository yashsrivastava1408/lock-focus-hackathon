# Lock Focus 🧠✨
> **An Intent-Aware, Adaptive Cognitive Ecosystem**

**Lock Focus** is a privacy-first web platform designed to assess, track, and improve cognitive focus through adaptive AI and gamified neuro-feedback. It bridges the gap between static content and neurodiverse needs (ADHD/Dyslexia) using real-time attention signals.

---

## 🏗️ Architecture & Data Flow

Lock Focus runs entirely **client-side** to ensure privacy and low latency. It leverages persistent browser storage and local AI models.

```mermaid
graph TD
    %% Actors
    User([👤 User]) -->|Interacts| UI[💻 Frontend Interface]

    %% Frontend Layer
    subgraph "Frontend Layer (React)"
        UI --> Router{React Router}
        Router -->|Route| P1[📊 ADHD Dashboard]
        Router -->|Route| P2[🎮 Dyslexia Workspace]
        Router -->|Route| P3[🕹️ Focus Flow Game]
        Router -->|Route| P4[⚡ Focus Scan Test]
    end

    %% Logic & Engine Layer
    subgraph "Engine & AI Layer (Browser-Native)"
        %% Neuro-Pilot Engine
        P3 -->|Triggers| NP_Engine[🚀 Neuro-Pilot Engine]
        TF[🧠 TensorFlow.js] -->|Loads| Blaze[🔥 Blazeface Model]
        Blaze -->|Face Detection| NP_Engine
        NP_Engine -->|Steering Signal| P3

        %% Focus Scan Engine
        P4 -->|Triggers| Reflex[⏱️ Reflex Analysis Engine]
        Reflex -->|Captures| Milliseconds[ms Response Time]

        %% Dyslexia Engine
        P2 -->|Triggers| Syllable[⚔️ Syllable Slasher Engine]
        Syllable -->|Input| WordData[Word Corpus]
        WordData -->|Chunking| Syllable
        
        %% Immersive Reader
        P2 -->|Triggers| Reader[📖 Immersive Reader]
        Tess[👁️ Tesseract.js] -->|OCR| Reader
    end

    %% Data Layer
    subgraph "Persistence Layer"
        Store[(🗄️ Local Storage)]
        P1 -->|Reads| Store
        Reflex -->|Writes Score| Store
        P3 -->|Writes High Score| Store
    end

    %% Flow Connections
    Milliseconds -->|Calculates| Score[Cognitive Score]
    Score --> Store
```

---

## 🚀 Key Features (Hackathon Prototype)

### 1. Neuro-Pilot Mode (Focus Flow) 🕹️
A "self-driving" game mode powered by your attention.
-   **How it works**: Uses `Blazeface` (TensorFlow.js) to detect if you are looking at the screen.
-   **The Pilot**: If you are **Focused**, the ship auto-dodges obstacles and collects points. If you **Look Away**, the ship stops, leading to a crash.
-   **Goal**: Gamifies the act of "sustaining attention" (Neurofeedback).

### 2. Focus Scan ⚡
A reaction-time and visual precision analyzer.
-   **Metrics**: Measures Reaction Time (ms) and Click Accuracy.
-   **Analysis**: Generates a "Cognitive Efficiency" score based on performance.

### 3. Syllable Slasher (Dyslexia Support) ⚔️
A reading assistant game.
-   **Mechanism**: Breaks down complex words into readable syllables (e.g., "Un-be-liev-a-ble").
-   **Impact**: Reduces phonological processing load for dyslexic users.

### 4. PeriQuest (Peripheral Vision Therapy) 👁️
A clinically-inspired game for visual field expansion.
-   **Mechanism**: Tracks your eye movements using **MediaPipe Iris Tracking** (Face Landmarker).
-   **The Challenge**: Focus on a center dot while reacting to shapes appearing in your peripheral vision.
-   **AI Guard**: If you look away from the center (cheat), the center dot turns red and fixation breaks are recorded.
-   **Impact**: Trains eccentric viewing and peripheral awareness.

---

## 🧪 Step-by-Step Judge's Walkthrough

Follow this guide to test the **functional prototype**:

### Step 1: Initialize the App
1.  Open the deployed link or `http://localhost:5173`.
2.  On the Landing Page, scroll down to the **"Vision Simulator"**.
3.  **Try it**: Click **"Dyslexia"** or **"ADHD"** to visually experience the problem statement.

### Step 2: Enter the Dashboard
1.  Click **"Open Prototype"** or **"Dashboard"** in the navigation.
2.  You will land on the **ADHD Dashboard**. Note the real-time "Optimal Focus" metrics.

### Step 3: Test "Neuro-Pilot" (The AI Hero Feature) 🌟
*This requires a webcam. No video is recorded; processing is 100% local.*
1.  Click the **"Training Center"** card or go to **Games -> Focus Flow**.
2.  **Disclaimer**: A privacy modal will appear. Click **"Enable Camera & Continue"**.
3.  **Allow Permission**: Browser will ask for camera access. Allow it.
4.  **Verify HUD**: Look at the top-left corner. You should see "Attention Signal: FOCUSED" (Green).
5.  **Activate**: Click the purple **"NEURO-PILOT"** button.
6.  **The Test**:
    -   **Look at the screen**: The ship drives itself safely.
    -   **Turn your head away**: The ship stops steering.
    -   *This proves the app is reacting to your physical attention in real-time.*

### Step 4: Test "Focus Scan"
1.  Return to Dashboard -> Click **"Focus Scan"** (Top Right Card).
2.  Click **"Start Analysis"**.
3.  Click the grid cells as they light up green.
4.  View your **Results** at the end (Score/Reaction Time).

### Step 5: Test "PeriQuest" (New: Iris Tracking) 👁️
1.  Go to **Games -> Peripheral Vision** (or click the Eye icon card).
2.  **Instructions**: Read the quick guide on the start screen.
3.  **Enable Tracking**: Click the **"Enable Eye Tracking"** button. Allow camera access.
4.  **Verification**: You will see a **Red Gaze Cursor** on the screen. Move your eyes to verify it tracks your gaze.
5.  **Play**:
    -   Press **SPACE** to start.
    -   Keep looking at the **Center Dot** (It glows Cyan).
    -   Press **SPACE** whenever a shape appears in your side vision.
    -   Try to "cheat" by looking at the shape - the center dot will turn **Red**, detecting your fixation break!

---

## 💡 Problem & Solution

### The Problem
-   **Static Interfaces**: Traditional UIs ignore user state. They don't know if you are bored, confused, or skimming.
-   **Neurodiversity Gap**: ADHD/Dyslexic users struggle with dense text and lack of feedback.

### The Solution: "Lock Focus"
-   **Adaptive**: Interfaces that react to *you*.
-   **Privacy-First**: Real-time AI that runs on *your device*, not the cloud.
-   **Gamified**: Turning cognitive therapy into engaging experiences.

---

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Framer Motion
-   **AI/ML**: TensorFlow.js (Blazeface), Google MediaPipe (Face Landmarker & Iris Tracking), Tesseract.js (OCR)
-   **Visualization**: Recharts (Analytics), Lucide React (Icons)
-   **Deployment**: Vercel / Netlify

---

## 🔒 Privacy & Ethics Statement

**Camera Usage**: The "Neuro-Pilot" feature uses the webcam solely for real-time face presence detection.
-   ✅ **Local Processing**: All video data is processed in the browser memory.
-   ✅ **No Storage**: No video or images are ever saved, stored, or transmitted to any server.
-   ✅ **Opt-In**: The feature is disabled by default and requires explicit user consent.

---

## 📦 Setup Instructions (Local)

1.  **Clone**: `git clone https://github.com/imarnv/lock-focus.git`
2.  **Install**: `npm install`
3.  **Run**: `npm run dev`
4.  **Visit**: `http://localhost:5173`
