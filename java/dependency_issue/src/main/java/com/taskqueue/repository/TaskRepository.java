package com.taskqueue.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Streams;
import com.taskqueue.model.Task;
import com.taskqueue.model.TaskStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class TaskRepository {

    private static final Logger logger = LoggerFactory.getLogger(TaskRepository.class);
    
    private static final String TASK_KEY_PREFIX = "task:";
    private static final String QUEUE_KEY_PREFIX = "queue:";
    private static final String SCHEDULED_KEY = "scheduled";
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    
    public TaskRepository(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }
    
    public Task save(Task task) {
        try {
            String key = TASK_KEY_PREFIX + task.getId();
            String json = objectMapper.writeValueAsString(task);
            redisTemplate.opsForValue().set(key, json);
            
            // Add to queue sorted set by priority
            String queueKey = QUEUE_KEY_PREFIX + task.getQueue();
            redisTemplate.opsForZSet().add(queueKey, task.getId(), task.getPriority());
            
            logger.info("Saved task: {}", task.getId());
            return task;
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize task", e);
            throw new RuntimeException("Failed to save task", e);
        }
    }
    
    public Optional<Task> findById(String id) {
        if (Strings.isNullOrEmpty(id)) {
            return Optional.empty();
        }
        
        String key = TASK_KEY_PREFIX + id;
        Object value = redisTemplate.opsForValue().get(key);
        
        if (value == null) {
            return Optional.empty();
        }
        
        try {
            Task task = objectMapper.readValue(value.toString(), Task.class);
            return Optional.of(task);
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize task", e);
            return Optional.empty();
        }
    }
    
    public List<Task> findByQueue(String queue) {
        String queueKey = QUEUE_KEY_PREFIX + queue;
        Set<Object> taskIds = redisTemplate.opsForZSet().range(queueKey, 0, -1);
        
        if (taskIds == null || taskIds.isEmpty()) {
            return ImmutableList.of();
        }
        
        return Streams.stream(taskIds.iterator())
                .map(id -> findById(id.toString()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }
    
    public List<Task> findByStatus(TaskStatus status) {
        // This is a naive implementation - would use Redis search in production
        Set<String> keys = redisTemplate.keys(TASK_KEY_PREFIX + "*");
        
        if (keys == null) {
            return ImmutableList.of();
        }
        
        return Streams.stream(keys.iterator())
                .map(key -> {
                    Object value = redisTemplate.opsForValue().get(key);
                    if (value == null) return null;
                    try {
                        return objectMapper.readValue(value.toString(), Task.class);
                    } catch (JsonProcessingException e) {
                        return null;
                    }
                })
                .filter(task -> task != null && task.getStatus() == status)
                .collect(Collectors.toList());
    }
    
    public Optional<Task> popNextTask(String queue) {
        String queueKey = QUEUE_KEY_PREFIX + queue;
        
        // Get highest priority task (lowest score)
        Set<Object> result = redisTemplate.opsForZSet().range(queueKey, 0, 0);
        
        if (result == null || result.isEmpty()) {
            return Optional.empty();
        }
        
        String taskId = result.iterator().next().toString();
        
        // Remove from queue
        redisTemplate.opsForZSet().remove(queueKey, taskId);
        
        return findById(taskId);
    }
    
    public void delete(String id) {
        Optional<Task> taskOpt = findById(id);
        
        taskOpt.ifPresent(task -> {
            String key = TASK_KEY_PREFIX + id;
            String queueKey = QUEUE_KEY_PREFIX + task.getQueue();
            
            redisTemplate.delete(key);
            redisTemplate.opsForZSet().remove(queueKey, id);
            
            logger.info("Deleted task: {}", id);
        });
    }
    
    public void scheduleTask(Task task, Duration delay) {
        long executeAt = System.currentTimeMillis() + delay.toMillis();
        
        save(task);
        task.setStatus(TaskStatus.SCHEDULED);
        
        redisTemplate.opsForZSet().add(SCHEDULED_KEY, task.getId(), executeAt);
    }
    
    public List<Task> getScheduledTasksDue() {
        long now = System.currentTimeMillis();
        Set<Object> taskIds = redisTemplate.opsForZSet().rangeByScore(SCHEDULED_KEY, 0, now);
        
        if (taskIds == null || taskIds.isEmpty()) {
            return ImmutableList.of();
        }
        
        List<Task> tasks = Streams.stream(taskIds.iterator())
                .map(id -> findById(id.toString()))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        
        // Remove from scheduled set
        redisTemplate.opsForZSet().removeRangeByScore(SCHEDULED_KEY, 0, now);
        
        return tasks;
    }
    
    public long countByQueue(String queue) {
        String queueKey = QUEUE_KEY_PREFIX + queue;
        Long count = redisTemplate.opsForZSet().size(queueKey);
        return count != null ? count : 0;
    }
}
