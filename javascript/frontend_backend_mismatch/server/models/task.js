// Task model - simulates database model

class Task {
    constructor(data) {
        this.task_id = data.task_id || `task_${Date.now()}`;
        this.user_id = data.user_id;
        this.title = data.title;
        this.description = data.description || '';
        this.status = data.status || 'pending';
        this.priority = data.priority || 'medium';
        this.due_date = data.due_date || null;
        this.created_at = data.created_at || new Date().toISOString();
        this.updated_at = data.updated_at || new Date().toISOString();
        this.tags = data.tags || [];
        this.assignee_id = data.assignee_id || null;
    }
    
    toJSON() {
        return {
            task_id: this.task_id,
            user_id: this.user_id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            due_date: this.due_date,
            created_at: this.created_at,
            updated_at: this.updated_at,
            tags: this.tags,
            assignee_id: this.assignee_id
        };
    }
    
    // Status validation
    static validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    
    static validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    isValidStatus(status) {
        return Task.validStatuses.includes(status);
    }
    
    update(data) {
        if (data.title !== undefined) this.title = data.title;
        if (data.description !== undefined) this.description = data.description;
        if (data.status !== undefined) this.status = data.status;
        if (data.priority !== undefined) this.priority = data.priority;
        if (data.due_date !== undefined) this.due_date = data.due_date;
        if (data.tags !== undefined) this.tags = data.tags;
        if (data.assignee_id !== undefined) this.assignee_id = data.assignee_id;
        this.updated_at = new Date().toISOString();
    }
}

// In-memory task store
const tasks = new Map();

const TaskStore = {
    create(taskData) {
        const task = new Task(taskData);
        tasks.set(task.task_id, task);
        return task;
    },
    
    findById(taskId) {
        return tasks.get(taskId) || null;
    },
    
    findByUserId(userId, options = {}) {
        const userTasks = Array.from(tasks.values())
            .filter(t => t.user_id === userId);
        
        // Apply filters
        let filtered = userTasks;
        
        if (options.status) {
            filtered = filtered.filter(t => t.status === options.status);
        }
        
        if (options.priority) {
            filtered = filtered.filter(t => t.priority === options.priority);
        }
        
        // Sort
        if (options.sortBy) {
            const sortField = options.sortBy;
            const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
            filtered.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1 * sortOrder;
                if (a[sortField] > b[sortField]) return 1 * sortOrder;
                return 0;
            });
        }
        
        // Frontend expects { data, totalCount, currentPage, pageSize }
        const page = options.page || 1;
        const limit = options.limit || 10;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);
        
        return {
            tasks: paginated.map(t => t.toJSON()),
            total: filtered.length,
            page,
            limit
        };
    },
    
    update(taskId, data) {
        const task = tasks.get(taskId);
        if (!task) return null;
        task.update(data);
        return task;
    },
    
    delete(taskId) {
        return tasks.delete(taskId);
    },
    
    // Seed some initial data
    seed(userId) {
        const sampleTasks = [
            { title: 'Review project proposal', description: 'Check the Q4 project proposal document', status: 'pending', priority: 'high' },
            { title: 'Update documentation', description: 'Update API docs with new endpoints', status: 'in_progress', priority: 'medium' },
            { title: 'Fix login bug', description: 'Users reporting issues with OAuth', status: 'pending', priority: 'urgent' },
            { title: 'Team meeting notes', description: 'Write up notes from standup', status: 'completed', priority: 'low' }
        ];
        
        sampleTasks.forEach(data => {
            this.create({ ...data, user_id: userId });
        });
    }
};

module.exports = { Task, TaskStore };
