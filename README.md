# 🚀 StudySync: Smart Exam Planner for Students

![StudySync Dashboard](https://placehold.co/800x400/21293d/e8e9ec?text=StudySync%20App%20Screenshot)

**StudySync** is a modern, AI-powered web application designed to help students organize their study materials, track their progress, and leverage generative AI to enhance their learning experience.

---

## ✨ Features

- **Subject & Topic Management**: Easily add subjects, chapters, and sub-topics to structure your study plan.
- **Progress Tracking**: Visualize your overall and per-subject progress to stay motivated.
- **AI Summary Generator**: Paste long texts or notes and get concise summaries and flashcards in seconds.
- **Optimal Break Scheduler**: Input your study session duration and receive an AI-generated schedule of optimal break times to maximize focus.
- **Practice Quiz Generator**: Test your knowledge by generating multiple-choice quizzes on any topic.
- **Pomodoro Timer**: Use the built-in Pomodoro timer for focused study sessions on any sub-topic.
- **Persistent Data**: Your study plan is automatically saved to your browser's local storage.
- **Light & Dark Mode**: Switch between themes for your viewing comfort.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Generative AI**: [Google's Genkit](https://firebase.google.com/docs/genkit)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

---

## 🏃‍♂️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer)
- `npm` or your favorite package manager

### 🔑 Step 1: Set Up Your API Key

The AI features in this project are powered by the Google Gemini API through Genkit. You will need your own API key for the AI functionalities to work.

1.  Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  In the root of the project, create a new file named `.env.local`.
3.  Copy the contents of the `.env` file into your new `.env.local` file.
4.  Add your API key to the `.env.local` file like this:

    ```bash
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

> **Note**: This file is included in `.gitignore` and will not be checked into source control.

### 🚀 Step 2: Installation & Execution

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/studysync.git
    cd studysync
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.

---

## ✍️ Author

This project was created by **[Your Name]**.

- **Portfolio**: [your-link]
- **GitHub**: [@your-username]
- **LinkedIn**: [@your-username]

---
