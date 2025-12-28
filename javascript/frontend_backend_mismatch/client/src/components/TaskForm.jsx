import { useState } from 'react';

const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

export function TaskForm({ onCreate, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
        tags: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        
        setError(null);
        setLoading(true);
        
        try {
            await onCreate({
                title: formData.title,
                description: formData.description,
                status: formData.status,  // 'todo' vs 'pending'
                priority: formData.priority,
                dueDate: formData.dueDate || null,
                assigneeId: formData.assigneeId || null,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
            });
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                dueDate: '',
                assigneeId: '',
                tags: ''
            });
            
            if (onCancel) onCancel();
        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="task-form-container">
            <h3>Create New Task</h3>
            
            {error && (
                <div className="error-message">{error}</div>
            )}
            
            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Task title"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your task..."
                        rows={3}
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="priority">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            {PRIORITY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input
                        id="tags"
                        name="tags"
                        type="text"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="bug, feature, urgent"
                    />
                </div>
                
                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                    {onCancel && (
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
