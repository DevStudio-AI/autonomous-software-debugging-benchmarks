import { useState } from 'react';

const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'archived', label: 'Archived' }
];
// Backend uses: pending, in_progress, completed, cancelled

const PRIORITY_COLORS = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
};

export function TaskList({ 
    tasks, 
    loading, 
    error, 
    pagination, 
    onUpdate, 
    onDelete, 
    onPageChange,
    onStatusFilter 
}) {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');
    
    const handleFilterChange = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        onStatusFilter(value === 'all' ? null : value);
    };
    
    const startEdit = (task) => {
        setEditingId(task.id);
        setEditValues({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority
        });
    };
    
    const saveEdit = async (taskId) => {
        try {
            await onUpdate(taskId, editValues);
            setEditingId(null);
            setEditValues({});
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };
    
    const cancelEdit = () => {
        setEditingId(null);
        setEditValues({});
    };
    
    // Also, dueDate might be Unix timestamp in some cases
    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    };
    
    // Backend sends different values (pending vs todo, etc.)
    const getStatusLabel = (status) => {
        const option = STATUS_OPTIONS.find(o => o.value === status);
        return option ? option.label : status;  // Will show raw backend value
    };
    
    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }
    
    if (error) {
        return <div className="error">Error: {error}</div>;
    }
    
    return (
        <div className="task-list">
            <div className="task-list-header">
                <h2>Your Tasks</h2>
                <div className="filters">
                    <select 
                        value={statusFilter} 
                        onChange={handleFilterChange}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        {STATUS_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {tasks.length === 0 ? (
                <div className="empty-state">
                    <p>No tasks found. Create your first task!</p>
                </div>
            ) : (
                <>
                    <ul className="tasks">
                        {tasks.map(task => (
                            <li key={task.id} className="task-item">
                                {editingId === task.id ? (
                                    <div className="task-edit">
                                        <input
                                            type="text"
                                            value={editValues.title}
                                            onChange={(e) => setEditValues({
                                                ...editValues,
                                                title: e.target.value
                                            })}
                                            className="edit-title"
                                        />
                                        <textarea
                                            value={editValues.description}
                                            onChange={(e) => setEditValues({
                                                ...editValues,
                                                description: e.target.value
                                            })}
                                            className="edit-description"
                                        />
                                        <select
                                            value={editValues.status}
                                            onChange={(e) => setEditValues({
                                                ...editValues,
                                                status: e.target.value
                                            })}
                                        >
                                            {STATUS_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="edit-actions">
                                            <button onClick={() => saveEdit(task.id)}>Save</button>
                                            <button onClick={cancelEdit}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="task-view">
                                        <div className="task-header">
                                            <h3 className="task-title">{task.title}</h3>
                                            <span 
                                                className="priority-badge"
                                                style={{ 
                                                    backgroundColor: PRIORITY_COLORS[task.priority] || '#6b7280'
                                                }}
                                            >
                                                {task.priority}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}
                                        <div className="task-meta">
                                            <span className="status">
                                                {getStatusLabel(task.status)}
                                            </span>
                                            <span className="due-date">
                                                {}
                                                Due: {formatDate(task.dueDate)}
                                            </span>
                                            <span className="created">
                                                {}
                                                Created: {formatDate(task.createdAt)}
                                            </span>
                                        </div>
                                        <div className="task-actions">
                                            <button onClick={() => startEdit(task)}>Edit</button>
                                            {}
                                            <button 
                                                onClick={() => onDelete(task.id)}
                                                className="delete-button"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    
                    {/* Pagination -
                    <div className="pagination">
                        <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                        >
                            Previous
                        </button>
                        <span>
                            Page {pagination.currentPage} of {Math.ceil(pagination.totalCount / pagination.pageSize) || 1}
                        </span>
                        <button
                            disabled={pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)}
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
