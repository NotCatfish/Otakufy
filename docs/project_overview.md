# 🏯 Otakufy

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

A highly interactive, gamified Japanese learning web application inspired by the Kotoba Discord bot. Otakufy helps users master JLPT N5 through N1 via a Custom Spaced Repetition System (SRS), dynamic flashcards, and competitive leaderboards.

---

## 📖 Documentation Directory
To keep this repository clean and adhere to the **Atomic Feature Documentation Protocol (`antigravityrule.txt` Rule #3 & #8)**, all architectural documentation is organized chronologically:

1. **[Chronological Feature State & AI Sync Log](./chat_history.md)**
   *Read this first for an exact chronological inventory of features implemented from Phase 1 (Core Engine) through Phase 12 (Frontend Optimization & Feature Redundancy Refactoring).*

2. **[Atomic Feature Documentation Archive](./feature_archive.md)**
   *Consolidated architecture documentation of all implementation phases.*

---

## 🚀 Quick Start & Development

### 1. Frontend (Web)
The Next.js frontend is located in the `web` directory.
```bash
cd web
npm install
npm run dev
```
*Runs locally on `http://localhost:3000`*

### 2. Backend (API)
The FastAPI backend is located in the `api` directory.
```bash
cd api
# Activate your virtual environment (e.g., venv\Scripts\activate)
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```
*Runs locally on `http://localhost:8000`*

### 3. Environment Setup
You must create a `.env` file in both the root and `web` directories containing your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
DATABASE_URL=your_direct_postgres_connection_string
```

---

## 📂 Repository Structure
- **`/web`**: Next.js 15 application containing all routing and pages.
- **`/features`**: Reusable React components, custom hooks, and isolated domains (auth, profile, practice).
- **`/api`**: FastAPI Python backend for heavy processing.
- **`/data_pipeline`**: Scripts and raw SQL files used to seed the Supabase PostgreSQL database.
- **`/master_readme`**: Master documentation hub.
