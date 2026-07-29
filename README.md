# Otakufy 🌸

🚀 **[Click here to visit the live site!](https://otakufy.vercel.app/)**

Welcome to **Otakufy**, a comprehensive Japanese learning platform designed to help users master Japanese vocabulary, grammar, kanji, and reading comprehension through spaced repetition, gamified progress, and interactive quizzes—all beautifully tailored to help you conquer the JLPT at your specific level.

## 🏗️ System Design Overview

Otakufy is built with a modern, serverless architecture that separates the frontend presentation layer from the backend database and authentication layers.

- **Frontend Interface:** A highly responsive, animated, and dynamic web application built to feel like a native mobile app. It handles the quiz engine, UI state, dark/light mode theming, and multi-language support locally.
- **Backend & Database:** We utilize a managed backend-as-a-service to securely handle user authentication, store progression (XP, levels, streaks), and maintain leaderboards.
- **Data Pipeline:** Japanese learning data (JLPT N5-N1 vocabulary, kanji, reading passages) is pre-processed and served statically or dynamically based on the learning mode to ensure lightning-fast quiz load times.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** Tailwind CSS (with custom animations and glassmorphism UI)
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment & Hosting:** Optimized for Vercel / Node.js environments

## 🚀 How to Run Locally

If you'd like to run the Otakufy web application on your local machine, follow these steps:

### Prerequisites
- Make sure you have **Node.js** (v18+) and **npm** installed on your machine.
- You will need a Supabase project if you wish to run the authentication and database features.

### 1. Clone the repository
```bash
git clone https://github.com/NotCatfish/otakufy.git
cd otakufy
```

### 2. Install dependencies
Navigate to the web directory where the Next.js application lives and install the required packages:
```bash
cd web
npm install
```

### 3. Environment Variables
To get the database and authentication working, create a `.env.local` file inside the `web/` directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server
Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Stay consistent, and continue your path to fluency!*
