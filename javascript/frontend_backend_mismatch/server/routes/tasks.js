/**
 * Task API routes
 * 
 * Note: There are intentional mismatches between this API
 * and what the frontend expects.
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Task = require('../models/task');

// In-memory task storage (mock database)
let tasks = [
    {
        task_id: 1,
        title: 'Complete project proposal',
        description: 'Write the Q1 project proposal document',
        completed: true,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id: 1,
        priority: 'high'
    },
    {
        task_id: 2,
        title: 'Review pull requests',
        description: 'Review pending PRs on the main repo',
        completed: false,
        due_date: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        user_id: 1,
        priority: 'medium'
    },
    {
        task_id: 3,
        title: 'Team meeting prep',
        description: 'Prepare slides for team meeting',
        completed: false,
        due_date: new Date(Date.now() + 172800000).toISOString(),
        created_at: new Date().toISOString(),
        user_id: 1,
        priority: 'low'
    }
];

let nextId = 4;

/**
 * GET /api/tasks
 * Get all tasks for authenticated user
 * 
 * Query params:
 *   - page: Page number (1-indexed)
 *   - limit: Items per page
 *   - status: Filter by completion status
 *   - priority: Filter by priority
 */
router.get('/', authenticateToken, (req, res) => {
    const { page = 1, limit = 10, status, priority } = req.query;
    const userId = req.user.id;
    
    let filteredTasks = tasks.filter(t => t.user_id === userId);
    
    // Apply filters
    if (status !== undefined) {
        const isCompleted = status === 'true' || status === true;
        filteredTasks = filteredTasks.filter(t => t.completed === isCompleted);
    }
    
    if (priority) {
        filteredTasks = filteredTasks.filter(t => t.priority === priority);
    }
    
    // Pagination - offset-based
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTasks = filteredTasks.slice(offset, offset + parseInt(limit));
    
    // This endpoint wraps in 'data', but POST doesn't
    res.json({
        data: paginatedTasks,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredTasks.length,
            totalPages: Math.ceil(filteredTasks.length / parseInt(limit))
        }
    });
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.task_id === taskId && t.user_id === req.user.id);
    
    if (!task) {
        return res.status(404).json({
            error: { message: 'Task not found', code: 'TASK_NOT_FOUND' }
        });
    }
    
    res.json(task);
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authenticateToken, (req, res) => {
    const { title, description, due_date, priority = 'medium' } = req.body;
    
    if (!title) {
        return res.status(400).json({
            error: { message: 'Title is required', code: 'VALIDATION_ERROR' }
        });
    }
    
    const newTask = {
        task_id: nextId++,
        title,
        description: description || '',
        completed: false,
        due_date: due_date ? new Date(due_date).toISOString() : null,
        created_at: new Date().toISOString(),
        user_id: req.user.id,
        priority
    };
    
    tasks.push(newTask);
    
    // Frontend may not handle 201 correctly
    res.status(201).json(newTask);
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put('/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.user_id === req.user.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            error: { message: 'Task not found', code: 'TASK_NOT_FOUND' }
        });
    }
    
    const { title, description, completed, due_date, priority } = req.body;
    
    // Update fields if provided
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (completed !== undefined) tasks[taskIndex].completed = completed;
    if (due_date !== undefined) tasks[taskIndex].due_date = new Date(due_date).toISOString();
    if (priority !== undefined) tasks[taskIndex].priority = priority;
    
    tasks[taskIndex].updated_at = new Date().toISOString();
    
    res.json({ task: tasks[taskIndex] });
});

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle task completion status
 */
router.patch('/:id/toggle', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.user_id === req.user.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            error: { message: 'Task not found', code: 'TASK_NOT_FOUND' }
        });
    }
    
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    tasks[taskIndex].updated_at = new Date().toISOString();
    
    // Returns just the new status
    res.json({ 
        task_id: taskId,
        completed: tasks[taskIndex].completed 
    });
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.task_id === taskId && t.user_id === req.user.id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            error: { message: 'Task not found', code: 'TASK_NOT_FOUND' }
        });
    }
    
    tasks.splice(taskIndex, 1);
    
    // Returns 204 No Content - correct
    res.status(204).send();
});

module.exports = router;
