# AI Career & Resume Analyzer

A full-stack career acceleration platform featuring AI-powered Applicant Tracking System (ATS) resume analysis, role-based interview question generation and answer evaluation, job application pipeline tracking, and 4-week structured learning roadmaps.

Built with **Next.js 16 App Router**, **React 19**, **Google Gemini AI**, **Supabase Auth & Storage**, and **Prisma ORM with PostgreSQL**.

---

## AI Engine: Google Gemini Integration

The platform uses Google Gemini via the official `@google/generative-ai` SDK (`src/lib/ai/gemini.ts`) for all server-side AI evaluations:

- **ATS Resume Analysis**: Parses resume text against job descriptions, computes match scores (0-100), extracts matching and missing skills, and provides structured feedback.
- **Interview Question Generator**: Generates 4 categories of questions (Technical, HR, Behavioral, Aptitude) tailored to candidate resume background and target job roles.
- **Interview Answer Evaluator**: Grades answers with score bounds, strengths, mistakes, areas for improvement, and actionable feedback.
- **Learning Roadmaps**: Generates 4-week milestone plans targeting specific missing skills.

### Configuring Google Gemini

1. Obtain a Gemini API key with free tier support from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Configure the following server-only environment variables in `.env` or `.env.local`:

```bash
# Server-only API key (never expose to the browser or prefix with NEXT_PUBLIC_)
GEMINI_API_KEY="AIzaSy..."

# Configurable Gemini model (defaults to gemini-1.5-flash if unset)
GEMINI_MODEL="gemini-1.5-flash"
```

### Supported Models

| Model | Recommended Use | Free Tier Support |
| :--- | :--- | :--- |
| `gemini-1.5-flash` | **Default / Recommended**: Ultra-fast latency, 1M context, generous free-tier rate limits. | Yes (Google AI Studio) |
| `gemini-1.5-pro` | High reasoning capability for complex, multifaceted resumes and senior technical roles. | Yes (Google AI Studio) |
| `gemini-2.0-flash` | Next-generation multimodal architecture for cutting-edge response speed. | Yes (where available) |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- A Supabase project with PostgreSQL database and a private `resumes` Storage bucket.
- A Google Gemini API key.

### 2. Environment Setup
Copy the template to your local environment file:
```bash
cp .env.example .env.local
```
Fill in your credentials according to `.env.example`.

### 3. Install Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Testing & Quality Assurance

Run the test suites:

```bash
# Run unit and stability tests (offline, mocked AI parsers, data validation)
npm test

# Run live service integration tests (verifies Supabase, PostgreSQL, Storage, and AI service)
npm run test:integration

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Production build verification
npm run build
```

---

## Security & Architectural Constraints

- **Server-Only AI Execution**: All Gemini API calls are strictly executed within server actions (`src/app/actions/*`) and backend libraries (`src/lib/ai/*`). The `GEMINI_API_KEY` is never leaked to the client bundle or sent in API responses.
- **Input Bounding**: Prompts and user inputs are strictly sliced (resumes to 30,000 characters, descriptions to 10,000 characters) to mitigate token exhaustion and prompt injection.
- **Strict Response Validation**: All AI responses are validated and clamped against TypeScript schemas without fabricating mock data when errors or quota limits are encountered.
