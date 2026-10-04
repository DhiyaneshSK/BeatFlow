# BeatFlow 🎵 | Digital Audio Workspace & Music Licensing Marketplace

> A local-first Digital Audio Workspace (DAW) and Independent Music Licensing Marketplace built with **Vanilla JavaScript**, **IndexedDB**, and **HTML5 Canvas**.

![BeatFlow License Marketplace](https://img.shields.io/badge/Architecture-Local--First-7c3aed?style=for-the-badge)
![UI](https://img.shields.io/badge/UI-Glassmorphism-00ffd2?style=for-the-badge)
![Audio Engine](https://img.shields.io/badge/Audio-CORS--Immune%20Canvas%20EQ-a855f7?style=for-the-badge)

---

## 🌟 Key Features

- **🎧 50 Unique, Fully Playable Tracks**: Seeded catalog featuring 50 distinct tracks across multiple genres (Lo-Fi, Alternative Rock, EDM, Synth-Pop, Ambient, and Sound FX) with separate custom album artwork.
- **⚡ Local-First Persistent Database**: Powered by browser-native **IndexedDB** (`BeatFlowDB_V1`) for zero-latency queries, offline availability, and self-healing schema migrations.
- **📊 CORS-Immune 60 FPS Canvas Visualizer**: Real-time frequency equalizer bars rendered via `requestAnimationFrame` on an HTML5 `<canvas>`, scaling dynamically with the audio player volume without Web Audio API CORS locks.
- **⚖️ Real-Time Royalty Splits Calculator**: Interactive percentage and dollar-value split management for Producer, Vocalist, and Writer, enforcing a strict 100% total balance in real time.
- **📄 Instant Digital Contract Generator**: Automatically compiles buyer and track metadata into legally formatted license agreements (Standard, Premium, Exclusive) with digital signature verification.
- **📤 Drag-and-Drop Local Song Uploader**: Full support for uploading custom `.mp3` and cover art files stored directly as Blobs in IndexedDB.
- **⌨️ DAW Accessibility Shortcuts**:
  - `Spacebar`: Toggle Play / Pause (with form-focus prevention).
  - `M`: Toggle Mute / Unmute.
  - `Esc`: Close all sliding drawers and active modals.

---

## 🏗️ Architecture & Technical Highlights

```
BeatFlow Architecture
├── Presentation Layer    --> Vanilla HTML5 + CSS Grid Glassmorphism
├── Visualizer Engine     --> HTML5 Canvas (60 FPS requestAnimationFrame loop)
├── State Management      --> Centralized Event-Driven State Store
├── Persistence Layer     --> IndexedDB (Client-side object store with Promise wrapper)
└── Local Audio Assets    --> 50 Local offline-cached audio files
```

### Engineering Highlights (For Interviewers):
1. **Bypassing Web Audio CORS Restrictions**: Traditional Web Audio API `AudioContext.createMediaElementSource` blocks external streaming. BeatFlow features a mock-equalizer renderer using harmonic sine equations modulated by audio amplitude.
2. **Local-First Reliability**: Zero network latency during live demonstrations; no buffering and 100% offline resilience.
3. **Decoupled State**: Unidirectional state mutations avoiding bloated frontend framework dependencies.

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Edge, Firefox, Brave, Safari)
- Optional: Node.js (for local HTTP server)

### Running Locally
You can open `index.html` directly in your browser, or serve it using any static HTTP server:

```bash
# Using npx serve (recommended)
npx serve .

# Or using Python
python -m http.server 8080
```

Visit `http://localhost:3000` or `http://localhost:8080`.

---

## 📁 Project Structure

```
beatflow/
├── audio/            # 50 Local high-quality audio files
├── app.js            # Central Controller, State Store & Event Listeners
├── db.js             # IndexedDB Database Engine & Catalog Seeder
├── index.html        # Semantic SPA Layout & DAW Workspaces
├── style.css         # Dark Neon Glassmorphism Styles & Responsive Grid
├── visualizer.js     # HTML5 Canvas 60 FPS Equalizer Engine
└── README.md         # Project Documentation
```

---

## 👤 Author
Developed as an advanced frontend & browser-systems engineering showcase project.
