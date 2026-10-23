# Student Management System Using Microservices

## Project Overview
A web-based Student Management System built using React.js, FastAPI, SQLite, and a microservices architecture. An API Gateway provides access to the backend services.

## Technologies
- Frontend: React.js, JavaScript, HTML, CSS, Vite
- Backend: Python and FastAPI
- Database: SQLite
- Authentication: JWT access tokens
- API testing: Postman
- Version control: Git and GitHub

## Features
- User registration and login
- JWT token validation
- Create, view, update, and delete student records
- Course listing and course management
- API Gateway and service health checks
- React dashboard
- Interactive FastAPI Swagger documentation

## Project Structure
- `api_gateway/` — API Gateway
- `auth_service/` — Registration, login, and token validation
- `student_service/` — Student management
- `course_service/` — Course management
- `frontend/` — React dashboard
- `postman/` — Postman API collection
- `screenshots/` — Project evidence

## Local URLs

| Component | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://127.0.0.1:8000 |
| Gateway documentation | http://127.0.0.1:8000/docs |
| Authentication service | http://127.0.0.1:8001 |
| Authentication documentation | http://127.0.0.1:8001/docs |
| Student service | http://127.0.0.1:8002 |
| Course service | http://127.0.0.1:8003 |

## Running the Project

Open separate PowerShell terminals in the project root. Start each backend service:

### API Gateway
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000 --app-dir ".\api_gateway"
```

### Authentication Service
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8001 --app-dir ".\auth_service"
```

### Student Service
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8002 --app-dir ".\student_service"
```

### Course Service
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8003 --app-dir ".\course_service"
```

Keep the terminals open. If any service has a different working startup command in your local project, use that command.

### Frontend
In another PowerShell terminal:

```powershell
Set-Location ".\frontend"
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## API Testing
Import `postman/Student_Management_Microservices.postman_collection.json` into Postman.

Gateway health check:

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/health" |
    ConvertTo-Json -Depth 5
```

## Screenshots
Save screenshots of the actual running dashboard, student add/edit operations, health checks, and authentication tests in the `screenshots/` directory before submission.

## Security
Do not commit passwords, access tokens, `.env` files, or local database files. Verify the `.gitignore` rules before committing.

## Conclusion
This project demonstrates a React frontend integrated with FastAPI microservices through an API Gateway, with student and course management, SQLite persistence, and authentication.
