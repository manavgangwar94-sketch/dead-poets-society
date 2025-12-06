# Dead Poets Society

A full-stack web application for sharing poems and literary works. Built with React on the frontend and Node.js/Express on the backend, featuring user authentication and a responsive dark-themed interface.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Scripts](#scripts)
- [Security Notes](#security-notes)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**: Register and login with JWT-based authentication
- **Create Posts**: Authenticated users can create and share poems
- **View Posts**: Browse all poems from the community
- **Delete Posts**: Remove your own poems
- **Protected Routes**: Secure pages that require authentication
- **Dark Theme UI**: Modern, responsive design with accent gradients
- **Real-time Navigation**: Smooth client-side routing with React Router

## 📁 Project Structure

```
dead-poets-society/
├── client/                 # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │   └── App.css
│   ├── package.json
│   └── .gitignore
│
├── server/                 # Express backend
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── index.js
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
└── .gitignore
```

## 🛠 Tech Stack

### Frontend
- **React** 19.2.0 - UI library
- **React Router** 7.9.6 - Client-side routing
- **React DOM** 19.2.0 - React rendering
- **Jest & Testing Library** - Testing framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** 4.19.0 - Web framework
- **MongoDB** - Database
- **Mongoose** 8.0.0 - ODM for MongoDB
- **JWT** 9.0.2 - Authentication tokens
- **bcryptjs** 3.0.3 - Password hashing
- **CORS** 2.8.5 - Cross-origin requests
- **dotenv** 17.2.3 - Environment variables

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance running locally or MongoDB Atlas account
- Git

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dead-poets-society
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Server Configuration

Create a `.env` file in the `server/` directory:

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/dead-poets-society
JWT_SECRET=your_secret_key_here
```

For MongoDB Atlas:
```bash
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dead-poets-society
```

### Client Configuration

The client proxies API requests to `http://localhost:5000`. Update `src/api.js` if needed for different API URLs.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

### Production Mode

```bash
cd client
npm run build

cd ../server
npm start
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |

**Register:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Posts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/posts` | Get all poems | No |
| POST | `/posts` | Create poem | Yes |
| DELETE | `/posts/:id` | Delete poem | Yes |

**Create Post:**
```json
{
  "title": "My Poem",
  "content": "Poetry content here..."
}
```

**Headers:**
```
Authorization: Bearer <token>
```

##  Scripts

### Server
```bash
npm start          # Production mode
npm run dev        # Development with nodemon
```

### Client
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

##  Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Protected routes require valid authentication tokens
- CORS enabled for cross-origin requests
- Never commit `.env` files to version control

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request



**Happy coding! Share your poetry with the world.** 