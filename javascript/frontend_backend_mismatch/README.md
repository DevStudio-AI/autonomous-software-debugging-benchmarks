# Task Manager - Frontend/Backend Mismatch

## Difficulty: ⭐⭐⭐⭐
## Pillar: Multi-File / Cross-Layer Bugs

## What This Project Does (When Fixed)

A full-stack task manager application with:
- React frontend for task management UI
- Express backend with REST API
- Real-time task updates
- User authentication with JWT
- Task filtering, sorting, and search

## Symptoms

When you run both frontend and backend:
- Tasks don't display correctly
- Creating tasks succeeds on backend but fails on frontend
- Authentication works but user data is wrong
- Filters don't return expected results
- Date formatting is inconsistent

Error messages vary:
```
TypeError: Cannot read property 'title' of undefined
Uncaught (in promise) SyntaxError: Unexpected token
Warning: Each child in a list should have a unique "key" prop
```

## Expected Success State

```
Frontend: http://localhost:3000
Backend: http://localhost:4000

$ npm run dev

✓ Backend running on port 4000
✓ Frontend running on port 3000
✓ API connection established

Task Manager loads:
┌─────────────────────────────────────────────┐
│  📋 My Tasks                         + Add  │
├─────────────────────────────────────────────┤
│  ☑ Complete project proposal      Due: Today│
│  ☐ Review pull requests         Due: Tomorrow│
│  ☐ Team meeting prep            Due: Dec 20│
├─────────────────────────────────────────────┤
│  Showing 3 of 3 tasks  │  Filter: All ▼    │
└─────────────────────────────────────────────┘
```

## How to Verify Success

```bash
# Terminal 1: Start backend
cd server
npm install
npm start

# Terminal 2: Start frontend  
cd client
npm install
npm start

# All these should work:
# - Tasks load and display
# - Can create new tasks
# - Can toggle task completion
# - Filters work correctly
# - No console errors
```

## Files

### Server (`server/`)
- `index.js` - Express server setup
- `routes/tasks.js` - Task API routes
- `routes/auth.js` - Authentication routes
- `middleware/auth.js` - JWT middleware
- `models/task.js` - Task data model

### Client (`client/`)
- `src/App.jsx` - Main React component
- `src/components/TaskList.jsx` - Task list component
- `src/components/TaskItem.jsx` - Individual task
- `src/services/api.js` - API client
- `src/hooks/useTasks.js` - Task state management
