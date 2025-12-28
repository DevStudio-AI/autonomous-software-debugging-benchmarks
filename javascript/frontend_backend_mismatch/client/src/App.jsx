/**
 * Task Manager - Main Application
 * 
 * This React app has multiple API contract mismatches with the backend.
 * All data fetches and mutations will fail due to:
 * - Field name mismatches (id vs task_id, camelCase vs snake_case)
 * - Response wrapper differences ({data: ...} vs flat)
 * - Date format differences (ISO vs Unix timestamp)
 * - Pagination parameter differences (pageSize vs limit)
 * - Status value differences (todo vs pending)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import Login from './components/Login';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
    const { user, loading: authLoading, error: authError, login, logout, checkAuth } = useAuth();
    const { 
        tasks, 
        loading: tasksLoading, 
        error: tasksError, 
        fetchTasks, 
        createTask, 
        updateTask, 
        deleteTask 
    } = useTasks();
    
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState({ status: 'all' });

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Fetch tasks when user is authenticated
    useEffect(() => {
        if (user) {
            fetchTasks({ 
                currentPage: 1,  // Backend expects 'page'
                pageSize: 20,    // Backend expects 'limit'
                status: filter.status === 'all' ? undefined : filter.status
            });
        }
    }, [user, filter]);

    // Handle login
    const handleLogin = async (email, password) => {
        try {
            await login(email, password);
            // due to field name mismatches (user_id vs id)
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    // Handle create task
    const handleCreateTask = async (taskData) => {
        try {
            await createTask({
                ...taskData,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null
            });
            setShowTaskForm(false);
            fetchTasks({ currentPage: 1, pageSize: 20 });
        } catch (err) {
            console.error('Create task failed:', err);
        }
    };

    // Handle update task
    const handleUpdateTask = async (taskId, updates) => {
        try {
            // but backend expects task_id in the URL
            await updateTask(taskId, updates);
            setEditingTask(null);
            fetchTasks({ currentPage: 1, pageSize: 20 });
        } catch (err) {
            console.error('Update task failed:', err);
        }
    };

    // Handle delete task
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            // expects { message: 'Deleted' }, gets { success: true }
            fetchTasks({ currentPage: 1, pageSize: 20 });
        } catch (err) {
            console.error('Delete task failed:', err);
        }
    };

    // Handle toggle task status
    const handleToggleStatus = async (task) => {
        // Frontend uses: todo, inProgress, done
        // Backend uses: pending, in_progress, completed
        const nextStatus = task.status === 'done' ? 'todo' : 'done';
        await handleUpdateTask(task.id, { status: nextStatus });
    };

    // Render loading state
    if (authLoading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Render login if not authenticated
    if (!user) {
        return <Login onLogin={handleLogin} error={authError} />;
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>Task Manager</h1>
                <div className="user-info">
                    {}
                    <span>Welcome, {user.name || user.email || 'User'}</span>
                    <button onClick={logout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </header>

            <main className="app-main">
                {/* Filter bar */}
                <div className="filter-bar">
                    <select 
                        value={filter.status} 
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="all">All Tasks</option>
                        {}
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    
                    <button 
                        onClick={() => setShowTaskForm(true)} 
                        className="btn-primary"
                    >
                        + New Task
                    </button>
                </div>

                {/* Error display */}
                {tasksError && (
                    <div className="error-banner">
                        {}
                        <p>{tasksError.message || tasksError}</p>
                        <button onClick={() => fetchTasks({ currentPage: 1, pageSize: 20 })}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Task list */}
                {tasksLoading ? (
                    <div className="tasks-loading">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <TaskList 
                        tasks={tasks}
                        onToggle={handleToggleStatus}
                        onEdit={(task) => setEditingTask(task)}
                        onDelete={handleDeleteTask}
                    />
                )}

                {/* Empty state */}
                {!tasksLoading && tasks.length === 0 && (
                    <div className="empty-state">
                        <p>No tasks found. Create your first task!</p>
                    </div>
                )}
            </main>

            {/* Task form modal */}
            {(showTaskForm || editingTask) && (
                <div className="modal-overlay">
                    <div className="modal">
                        <TaskForm 
                            task={editingTask}
                            onSubmit={editingTask 
                                ? (data) => handleUpdateTask(editingTask.id, data)
                                : handleCreateTask
                            }
                            onCancel={() => {
                                setShowTaskForm(false);
                                setEditingTask(null);
                            }}
                        />
                    </div>
                </div>
            )}

            <footer className="app-footer">
                <p>Task Manager v1.0</p>
            </footer>
        </div>
    );
}

export default App;
