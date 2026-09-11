# Otakufy Web Client

The primary Next.js 16 frontend application for Otakufy. Built with React 19, Tailwind CSS v4, and Supabase SSR.

---

## $\color{#F59E0B}{\text{Getting Started}}$

### **$\color{#38BDF8}\text{1. Install Dependencies}$**
```bash
npm install
```

### **$\color{#38BDF8}\text{2. Local Development}$**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## $\color{#F59E0B}{\text{Available Scripts}}$

- **$\color{#38BDF8}\text{npm run dev:}$** Launches Next.js local development server with Hot Module Reloading (HMR).
- **$\color{#38BDF8}\text{npm run build:}$** Verifies clean compilation and bundles static/SSR pages for production.
- **$\color{#38BDF8}\text{npm run start:}$** Starts the production server.
- **$\color{#38BDF8}\text{npm run lint:}$** Runs ESLint 9 checks across all frontend components.

---

## $\color{#F59E0B}{\text{Architecture and Design Tokens}}$

- **$\color{#38BDF8}\text{Framework:}$** Next.js 16 (`16.3.4`), React 19 (`19.2.7`)
- **$\color{#38BDF8}\text{Styling:}$** Tailwind CSS v4 with Japanese Ministry of Education typography (`Noto Serif JP`, `Noto Sans JP`)
- **$\color{#38BDF8}\text{State and Cache:}$** LocalForage IndexedDB (`v14`) and SessionStorage checkpoints
- **$\color{#38BDF8}\text{Security:}$** DOMPurify HTML sanitization for ruby Furigana rendering
