// API Service - Frontend expectations that don't match backend
// This file contains all the contract mismatches that cause failures

const API_BASE = 'http://localhost:3001/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': token } : {};  // Missing 'Bearer ' prefix
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'An error occurred');
    }
    return response.json();
};

export const authApi = {
    async register(email, password, name) {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const result = await handleResponse(response);
        return result;
    },
    
    async login(email, password) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await handleResponse(response);
        if (result.token) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('tokenExpiry', result.expiresAt);
        }
        return result;
    },
    
    async logout() {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        const result = await handleResponse(response);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        return result;
    },
    
    async getCurrentUser() {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeaders()
        });
        const result = await handleResponse(response);
        return result;
    }
};

export const tasksApi = {
    async getTasks(options = {}) {
        const params = new URLSearchParams();
        
        if (options.pageSize) params.append('pageSize', options.pageSize);
        if (options.currentPage) params.append('currentPage', options.currentPage);
        if (options.status) params.append('status', options.status);
        if (options.sortBy) params.append('sortBy', options.sortBy);
        if (options.sortOrder) params.append('sortOrder', options.sortOrder);
        
        const response = await fetch(`${API_BASE}/tasks?${params}`, {
            headers: getAuthHeaders()
        });
        const result = await handleResponse(response);
        // Backend sends { tasks, total, page, limit }
        return result;
    },
    
    async getTask(taskId) {
        // Backend uses 'task_id', expects /tasks/:task_id
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            headers: getAuthHeaders()
        });
        const result = await handleResponse(response);
        return result;
    },
    
    async createTask(taskData) {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                title: taskData.title,
                description: taskData.description,
                status: taskData.status,  // 'todo' vs 'pending'
                priority: taskData.priority,
                dueDate: taskData.dueDate,  // camelCase vs due_date
                assigneeId: taskData.assigneeId,  // camelCase vs assignee_id
                tags: taskData.tags
            })
        });
        const result = await handleResponse(response);
        return result;
    },
    
    async updateTask(taskId, updates) {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(updates)  // Same camelCase vs snake_case issue
        });
        const result = await handleResponse(response);
        return result;
    },
    
    async deleteTask(taskId) {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const result = await handleResponse(response);
        return result;
    }
};

// Status mapping that frontend uses (but doesn't apply when sending to backend)
export const STATUS_MAP = {
    todo: 'todo',
    inProgress: 'inProgress', 
    done: 'done',
    archived: 'archived'
};
// Backend actually uses: pending, in_progress, completed, cancelled
