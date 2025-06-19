# IPARPA Project
#Making Some tests Sorry 
## Overview
IPARPA is a full-stack application that consists of a backend built with Express and a frontend developed using React with Vite. The backend connects to a MongoDB database, providing a robust API for the frontend to interact with.

## Project Structure
```
IPARPA
├── backend
│   ├── src
│   │   ├── controllers        # Contains request handlers
│   │   ├── models             # Mongoose models for MongoDB
│   │   ├── routes             # API routes
│   │   ├── middleware         # Authentication middleware
│   │   ├── config             # Database configuration
│   │   ├── utils              # Utility functions
│   │   └── app.js             # Entry point for the backend
│   ├── package.json           # Backend dependencies and scripts
│   └── README.md              # Documentation for the backend
├── frontend
│   ├── src
│   │   ├── assets             # Static assets
│   │   ├── components         # Reusable React components
│   │   ├── pages              # Main page components
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Entry point for the React app
│   ├── index.html             # Main HTML file for the React app
│   ├── package.json           # Frontend dependencies and scripts
│   ├── vite.config.js         # Vite configuration
│   └── README.md              # Documentation for the frontend
├── .gitignore                 # Files to ignore in Git
├── package.json               # Overall project dependencies and scripts
└── README.md                  # Documentation for the entire project
```

## Getting Started

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## License
This project is licensed under the MIT License.
