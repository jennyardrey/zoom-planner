## Packages
firebase | Backend-as-a-Service for Auth and Firestore
date-fns | Date manipulation and formatting
framer-motion | Smooth UI transitions and animations
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
The application uses Firebase Authentication and Firestore.
Authentication handles user login/signup.
Firestore stores user-specific data under `users/{uid}/...` collections.
Environment variables VITE_FIREBASE_API_KEY, etc. are required for Firebase initialization.
