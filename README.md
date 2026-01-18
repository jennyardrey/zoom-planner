# Zoom Planner

Zoom Planner is a comprehensive goal, habit, and task tracking application designed to help users bridge the gap between high-level aspirations and daily actions.

## 🏗 Architecture Overview

The application follows a **Thick Client** architecture:

*   **Frontend**: A robust React Single Page Application (SPA) that handles all business logic, routing, and data processing.
*   **Backend Services**: 
    *   **Firebase**: Directly accessed by the client for Authentication (Firebase Auth) and Database (Firestore).
    *   **Server**: A minimal Node.js/Express server that serves the static frontend assets and handles fallback routing for the SPA.

## ✨ Features

*   **Goal Tracking**: Set and visualize goals across different timeframes (Year, Month, Week).
*   **Habit Formation**: Create habits, set schedules (Daily/Weekdays), and log progress.
*   **Task Management**: granular task management with Day, Week, and Month views.
*   **Authentication**: Secure user login and registration powered by Firebase.
*   **Responsive Design**: A clean, modern UI optimized for desktop and tablet usage.

## 🛠 Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Shadcn/ui](https://ui.shadcn.com/) components
*   **Routing**: [wouter](https://github.com/molefrog/wouter)
*   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend / Infrastructure
*   **Runtime**: [Node.js](https://nodejs.org/) (Express)
*   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)

## 📁 Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/      # Custom React hooks (e.g., use-auth)
│   │   ├── pages/      # Page views (DayView, GoalsPage, etc.)
│   │   ├── services/   # Firebase service layer (goals.ts, tasks.ts)
│   │   └── App.tsx     # Main app component & routing
│
├── server/             # Express server for static serving
│   ├── index.ts        # Server entry point
│   └── routes.ts       # API routes (minimal/none)
│
└── shared/             # Shared code between client & server
    └── schema.ts       # Zod schemas & type definitions
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd zoom-planner
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Setup

Create a `.env` file in the root directory with your Firebase configuration keys:

```prop
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally

Start the development server:

```bash
npm run dev
```

This will run the backend on port 5000 (default) and proxy frontend requests. Open [http://0.0.0.0:5000](http://0.0.0.0:5000) in your browser.

## 🗃 Data Models

Data is structured in Firestore but typed via Zod schemas in `shared/schema.ts`:

*   **Goals**: Hierarchical goals (Yearly -> Monthly -> Weekly).
*   **Tasks**: Actionable items linked to specific dates and optional parent goals.
*   **Habits**: Recurring activities with valid/invalid boolean logs per date.
