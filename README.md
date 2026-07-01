# EPL Score Predictor

EPL Score Predictor is a full-stack MERN project for predicting Premier League match scores. Users can register, log in, view fixtures, submit score predictions before kickoff, earn points based on prediction accuracy, and compete on a leaderboard.

The project also includes a demo simulation mode so the full prediction flow can be demonstrated without relying on live Premier League matches. In demo mode, an admin/demo user can create a fake fixture, lock predictions, enter the final score, calculate points, and update the leaderboard.

---

## Project Goals

The purpose of this project is to build a complete web and mobile application using a modern full-stack architecture. 

---

## Core Features

### User Authentication

- User registration
- User login
- Password hashing
- JSON Web Token authentication
- Email verification
- Forgot password flow
- Protected routes for logged-in users

### Fixtures

- View available Premier League fixtures
- View match details
- Prevent predictions after fixture lock/kickoff
- Support demo fixtures for presentations

### Predictions

- Submit predicted scores between 2 teams
- Edit predictions before the fixture locks
- Store predictions per user and fixture
- Prevent duplicate predictions for the same fixture

### Scoring

Users earn points based on prediction accuracy. The exact scoring rules can be adjusted by the team, but the planned scoring system is:

- Exact score prediction: highest points
- Correct winner/draw result: partial points
- Correct goal difference: bonus or partial points
- Incorrect prediction: zero or minimal points

### Leaderboard

- Show users ranked by total points
- Update rankings after match results are entered
- Support demo updates after simulated results

### Demo Simulation Mode

Because live Premier League matches may not be available during the final demo, the app includes a demo mode.

Demo mode allows the team to show the entire app flow:

1. Create a fake fixture
2. Allow users to submit predictions
3. Lock the fixture
4. Enter a final score
5. Calculate points
6. Update the leaderboard

This ensures the final presentation does not depend on a real match happening during class.

---

## Tech Stack

### Frontend Web

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

The web frontend is responsible for the main browser-based user experience. Users can register, log in, view fixtures, submit predictions, view their profile, and check the leaderboard.

### Backend API

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- CORS
- dotenv
- Nodemailer or SendGrid

The backend handles API routes, authentication, database models, scoring logic, email verification, password reset, fixtures, predictions, leaderboard updates, and demo simulation behavior.

### Database

- MongoDB Atlas

MongoDB Atlas is used as the remote database. This satisfies the requirement that the project must use a hosted/remote database rather than a purely local database.

### Mobile App

- React Native
- Expo
- Axios

The mobile app allows users to access core project features from a physical phone. For the final presentation, the mobile app must be shown on a real device using a webcam, not an emulator.

### API Documentation

- SwaggerHub
- OpenAPI / Swagger YAML

At least one API endpoint must be documented through SwaggerHub. The backend may also include a local `swagger.yaml` file for reference.

### Testing

- Jest
- Supertest

Testing is used for backend unit and API route tests. The initial test verifies the health endpoint. More tests should be added for authentication, scoring logic, predictions, and leaderboard behavior.

### Hosting

Planned hosting options:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Heroku
- Database: MongoDB Atlas
- Mobile: Expo Go / Expo development build

---

## Repository Structure

```text
epl_score_predictor/
│
├── client/
├── server/
├── mobile/
├── docs/
├── presentation/
├── README.md
└── .gitignore
