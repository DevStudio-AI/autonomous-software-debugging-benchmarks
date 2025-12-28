package com.taskqueue.util;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

@Component
public class TaskMetrics {

    private final Map<String, QueueMetrics> queueMetrics = new ConcurrentHashMap<>();
    
    private QueueMetrics getOrCreateMetrics(String queue) {
        return queueMetrics.computeIfAbsent(queue, k -> new QueueMetrics());
    }
    
    public void recordEnqueue(String queue) {
        getOrCreateMetrics(queue).enqueued.increment();
    }
    
    public void recordSuccess(String queue, long processingTimeMs) {
        QueueMetrics metrics = getOrCreateMetrics(queue);
        metrics.successful.increment();
        metrics.totalProcessingTime.add(processingTimeMs);
    }
    
    public void recordFailure(String queue) {
        getOrCreateMetrics(queue).failed.increment();
    }
    
    public void recordRetry(String queue) {
        getOrCreateMetrics(queue).retried.increment();
    }
    
    public MetricsSnapshot getSnapshot(String queue) {
        QueueMetrics metrics = queueMetrics.get(queue);
        if (metrics == null) {
            return new MetricsSnapshot(0, 0, 0, 0, 0);
        }
        
        long successful = metrics.successful.sum();
        long totalTime = metrics.totalProcessingTime.sum();
        double avgTime = successful > 0 ? (double) totalTime / successful : 0;
        
        return new MetricsSnapshot(
            metrics.enqueued.sum(),
            successful,
            metrics.failed.sum(),
            metrics.retried.sum(),
            avgTime
        );
    }
    
    public Map<String, MetricsSnapshot> getAllSnapshots() {
        Map<String, MetricsSnapshot> snapshots = new ConcurrentHashMap<>();
        for (Map.Entry<String, QueueMetrics> entry : queueMetrics.entrySet()) {
            snapshots.put(entry.getKey(), getSnapshot(entry.getKey()));
        }
        return snapshots;
    }
    
    private static class QueueMetrics {
        final LongAdder enqueued = new LongAdder();
        final LongAdder successful = new LongAdder();
        final LongAdder failed = new LongAdder();
        final LongAdder retried = new LongAdder();
        final LongAdder totalProcessingTime = new LongAdder();
    }
    
    public record MetricsSnapshot(
        long enqueued,
        long successful,
        long failed,
        long retried,
        double averageProcessingTimeMs
    ) {}
}
