import { useState, useEffect, useCallback } from 'react';
import { tasksApi, STATUS_MAP } from '../services/api';

export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalCount: 0
    });
    const [filters, setFilters] = useState({
        status: null,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await tasksApi.getTasks({
                currentPage: pagination.currentPage,
                pageSize: pagination.pageSize,
                status: filters.status,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });
            
            // Backend sends { tasks, total, page, limit }
            
            // This will fail - result.data is undefined
            const taskList = result.data || [];
            
            // Expects { id, title, status, dueDate, assigneeId }
            // Gets { task_id, title, status, due_date, assignee_id }
            const normalizedTasks = taskList.map(task => ({
                id: task.id,  // undefined - backend sends task_id
                title: task.title,
                description: task.description,
                status: task.status,  // 'pending' vs 'todo'
                priority: task.priority,
                dueDate: task.dueDate,  // undefined - backend sends due_date
                createdAt: task.createdAt,  // undefined - backend sends created_at
                assigneeId: task.assigneeId,  // undefined - backend sends assignee_id
                tags: task.tags
            }));
            
            setTasks(normalizedTasks);
            
            setPagination(prev => ({
                ...prev,
                totalCount: result.totalCount || 0,  // undefined
                currentPage: result.currentPage || 1  // undefined
            }));
            
        } catch (err) {
            setError(err.message);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.pageSize, filters]);
    
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    const createTask = useCallback(async (taskData) => {
        setError(null);
        
        try {
            const result = await tasksApi.createTask({
                title: taskData.title,
                description: taskData.description,
                status: taskData.status || 'todo',  // Wrong status value
                priority: taskData.priority || 'medium',
                dueDate: taskData.dueDate,  // camelCase, backend wants due_date
                assigneeId: taskData.assigneeId,  // camelCase, backend wants assignee_id
                tags: taskData.tags || []
            });
            
            // Refresh to get new task (since we can't parse the response properly)
            await fetchTasks();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [fetchTasks]);
    
    const updateTask = useCallback(async (taskId, updates) => {
        setError(null);
        
        try {
            const result = await tasksApi.updateTask(taskId, {
                title: updates.title,
                description: updates.description,
                status: updates.status,
                priority: updates.priority,
                dueDate: updates.dueDate,
                assigneeId: updates.assigneeId,
                tags: updates.tags
            });
            
            await fetchTasks();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [fetchTasks]);
    
    const deleteTask = useCallback(async (taskId) => {
        setError(null);
        
        try {
            await tasksApi.deleteTask(taskId);
            await fetchTasks();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [fetchTasks]);
    
    const setPage = useCallback((page) => {
        setPagination(prev => ({ ...prev, currentPage: page }));
    }, []);
    
    const setPageSize = useCallback((size) => {
        setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
    }, []);
    
    const setStatusFilter = useCallback((status) => {
        setFilters(prev => ({ ...prev, status }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);
    
    return {
        tasks,
        loading,
        error,
        pagination,
        filters,
        createTask,
        updateTask,
        deleteTask,
        refresh: fetchTasks,
        setPage,
        setPageSize,
        setStatusFilter
    };
}
