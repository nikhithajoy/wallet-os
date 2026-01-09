# ExpenseFlow - Expense Tracker

A modern expense tracking application with a React frontend and FastAPI backend.

## Project Structure

```
expense_tracker/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   │   ├── auth.py    # Authentication routes
│   │   │   └── expenses.py # Expense CRUD routes
│   │   ├── core/          # Core utilities
│   │   │   ├── config.py  # Configuration settings
│   │   │   └── security.py # JWT & password utilities
│   │   ├── db/            # Database
│   │   │   ├── models.py  # SQLAlchemy models
│   │   │   └── session.py # Database session
│   │   ├── schemas/       # Pydantic schemas
│   │   └── main.py        # FastAPI app entry
│   ├── requirements.txt
│   ├── create_tables.py
│   └── .env.example
├── docker-compose.yml      # PostgreSQL database
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (for PostgreSQL)

### 1. Start the Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432.

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Create database tables
python create_tables.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get token |

### Expenses (Protected - requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all user expenses |
| POST | `/api/expenses` | Create new expense |
| GET | `/api/expenses/{id}` | Get expense by ID |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://expense_user:strongpassword@localhost:5432/expense_tracker
SECRET_KEY=your-super-secret-key-change-in-production
```

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS (via CDN)
- Recharts (charts)
- Lucide React (icons)

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

## Features

- 🔐 User authentication (login/register)
- 💰 Track income and expenses
- 📊 Analytics with charts
- 📋 Spreadsheet view
- 🤖 Built-in expense assistant chatbot
- 🎨 Modern dark theme UI
