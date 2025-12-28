package com.taskqueue.service;

import com.taskqueue.model.Task;
import com.taskqueue.model.TaskStatus;
import com.taskqueue.repository.TaskRepository;
import com.taskqueue.util.TaskMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.function.Consumer;

@Service
public class QueueService {

    private static final Logger logger = LoggerFactory.getLogger(QueueService.class);
    
    private final TaskRepository taskRepository;
    private final TaskMetrics taskMetrics;
    private final Map<String, Consumer<Task>> handlers;
    private final ExecutorService executor;
    private final ScheduledExecutorService scheduler;
    
    private volatile boolean running = false;
    
    public QueueService(TaskRepository taskRepository, TaskMetrics taskMetrics) {
        this.taskRepository = taskRepository;
        this.taskMetrics = taskMetrics;
        this.handlers = new ConcurrentHashMap<>();
        this.executor = Executors.newFixedThreadPool(
            Runtime.getRuntime().availableProcessors()
        );
        this.scheduler = Executors.newScheduledThreadPool(2);
    }
    
    public void registerHandler(String taskName, Consumer<Task> handler) {
        handlers.put(taskName, handler);
        logger.info("Registered handler for task: {}", taskName);
    }
    
    public Task enqueue(String name, String queue, Map<String, Object> payload) {
        Task task = new Task(name, queue, payload);
        taskRepository.save(task);
        taskMetrics.recordEnqueue(queue);
        logger.info("Enqueued task {} to queue {}", task.getId(), queue);
        return task;
    }
    
    public Task enqueue(String name, String queue, Map<String, Object> payload, int priority) {
        Task task = new Task(name, queue, payload);
        task.setPriority(priority);
        taskRepository.save(task);
        taskMetrics.recordEnqueue(queue);
        return task;
    }
    
    public Task schedule(String name, String queue, Map<String, Object> payload, Duration delay) {
        Task task = new Task(name, queue, payload);
        task.setScheduledAt(LocalDateTime.now().plus(delay));
        taskRepository.scheduleTask(task, delay);
        logger.info("Scheduled task {} for {} later", task.getId(), delay);
        return task;
    }
    
    public Optional<Task> getTask(String id) {
        return taskRepository.findById(id);
    }
    
    public List<Task> getQueuedTasks(String queue) {
        return taskRepository.findByQueue(queue);
    }
    
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }
    
    public void cancelTask(String id) {
        taskRepository.findById(id).ifPresent(task -> {
            task.setStatus(TaskStatus.CANCELLED);
            taskRepository.save(task);
            logger.info("Cancelled task: {}", id);
        });
    }
    
    public void startProcessing(String... queues) {
        running = true;
        
        for (String queue : queues) {
            executor.submit(() -> processQueue(queue));
        }
        
        // Schedule periodic check for delayed tasks
        scheduler.scheduleAtFixedRate(
            this::processScheduledTasks,
            0, 1, TimeUnit.SECONDS
        );
        
        logger.info("Started processing queues: {}", String.join(", ", queues));
    }
    
    public void stopProcessing() {
        running = false;
        executor.shutdown();
        scheduler.shutdown();
        
        try {
            if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
            if (!scheduler.awaitTermination(30, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        logger.info("Stopped processing");
    }
    
    private void processQueue(String queue) {
        while (running) {
            try {
                Optional<Task> taskOpt = taskRepository.popNextTask(queue);
                
                if (taskOpt.isPresent()) {
                    processTask(taskOpt.get());
                } else {
                    // No tasks available, wait a bit
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                logger.error("Error processing queue {}", queue, e);
            }
        }
    }
    
    private void processTask(Task task) {
        Consumer<Task> handler = handlers.get(task.getName());
        
        if (handler == null) {
            logger.warn("No handler registered for task: {}", task.getName());
            task.setStatus(TaskStatus.FAILED);
            task.setErrorMessage("No handler registered");
            taskRepository.save(task);
            return;
        }
        
        task.setStatus(TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        taskRepository.save(task);
        
        long startTime = System.currentTimeMillis();
        
        try {
            handler.accept(task);
            
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
            taskMetrics.recordSuccess(task.getQueue(), System.currentTimeMillis() - startTime);
            
            logger.info("Completed task: {}", task.getId());
        } catch (Exception e) {
            logger.error("Task {} failed", task.getId(), e);
            
            task.setErrorMessage(e.getMessage());
            
            if (task.canRetry()) {
                task.incrementRetry();
                task.setStatus(TaskStatus.RETRY_PENDING);
                
                // Re-enqueue with exponential backoff
                Duration delay = Duration.ofSeconds((long) Math.pow(2, task.getRetryCount()));
                taskRepository.scheduleTask(task, delay);
                
                taskMetrics.recordRetry(task.getQueue());
                logger.info("Scheduled retry {} for task {}", task.getRetryCount(), task.getId());
            } else {
                task.setStatus(TaskStatus.FAILED);
                taskMetrics.recordFailure(task.getQueue());
                logger.error("Task {} failed after {} retries", task.getId(), task.getRetryCount());
            }
        }
        
        taskRepository.save(task);
    }
    
    private void processScheduledTasks() {
        try {
            List<Task> dueTasks = taskRepository.getScheduledTasksDue();
            
            for (Task task : dueTasks) {
                task.setStatus(TaskStatus.PENDING);
                taskRepository.save(task);
                logger.debug("Moved scheduled task {} to pending", task.getId());
            }
        } catch (Exception e) {
            logger.error("Error processing scheduled tasks", e);
        }
    }
    
    public long getQueueSize(String queue) {
        return taskRepository.countByQueue(queue);
    }
}
