# SnapSight AI 📸🧠

> Transform screenshots into accessible content with AI-powered vision and voice

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4--Vision-412991.svg)](https://openai.com/)

## 🎯 What is SnapSight?

SnapSight is an AI-powered web application that makes visual content accessible to everyone. Capture any part of your screen, and our AI will:

- 📝 **Extract all text** (OCR) from images
- 🔍 **Analyze visual content** with GPT-4 Vision
- 📄 **Generate formatted Markdown** documentation
- 🔊 **Convert to natural speech** for audio playback

Perfect for accessibility, documentation, research, and learning.

## ✨ Features

- **Instant Screen Capture** - Browser-native screen recording API
- **AI Vision Analysis** - Powered by OpenAI GPT-4 Vision
- **Smart OCR** - Extract text from any image automatically
- **Text-to-Speech** - Natural voice synthesis with OpenAI TTS
- **Markdown Export** - Save analysis as formatted documents
- **Privacy First** - Secure API handling, no data storage

## 🏆 Built for YuKeSong2025 Hackathon

**Theme:** AI for Good
**Goal:** Make visual information accessible to everyone

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Twynzen/visionRead.git
cd visionRead

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run development server
npm start
```

Visit `http://localhost:4200`

## 🛠️ Tech Stack

- **Frontend:** Angular 17+ (Standalone Components)
- **UI:** Angular Material
- **AI:** OpenAI GPT-4 Vision + TTS
- **Backend:** Vercel Serverless Functions
- **Deployment:** Vercel

## 📦 Project Structure

```
snapsight/
├── src/app/
│   ├── components/      # UI components
│   ├── services/        # Business logic
│   └── models/          # TypeScript interfaces
├── api/                 # Serverless functions
└── public/              # Static assets
```

## 🎨 How It Works

1. **Capture** - Click to capture any screen area
2. **Analyze** - AI analyzes the image content
3. **Read** - View results as text and markdown
4. **Listen** - Play audio version with natural voice

## 🤝 Contributing

This is a hackathon project built for YuKeSong2025. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👥 Team

Built with by:
- **Daniel** - Development & Architecture
- **Claude** - AI Assistant & Code Generation

## 🙏 Acknowledgments

- YuKeSong2025 Hackathon organizers
- OpenAI for Vision and TTS APIs
- Angular and Vercel teams

---

**Made with for AI for Good** 🌟
