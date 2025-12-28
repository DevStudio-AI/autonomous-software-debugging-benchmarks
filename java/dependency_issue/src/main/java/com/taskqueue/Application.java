package com.taskqueue;

import com.taskqueue.model.Task;
import com.taskqueue.service.QueueService;
import com.taskqueue.util.TaskMetrics;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Map;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public CommandLineRunner demo(QueueService queueService, TaskMetrics metrics) {
        return args -> {
            // Register task handlers
            queueService.registerHandler("email.send", this::handleEmailTask);
            queueService.registerHandler("report.generate", this::handleReportTask);
            queueService.registerHandler("notification.push", this::handleNotificationTask);

            // Start processing
            queueService.startProcessing("emails", "reports", "notifications");

            // Enqueue some demo tasks
            queueService.enqueue("email.send", "emails", Map.of(
                "to", "user@example.com",
                "subject", "Welcome!",
                "body", "Thanks for signing up."
            ));

            queueService.enqueue("report.generate", "reports", Map.of(
                "reportType", "monthly",
                "userId", "12345"
            ), 10); // Higher priority

            queueService.enqueue("notification.push", "notifications", Map.of(
                "userId", "12345",
                "message", "Your report is ready!"
            ));

            // Let tasks process
            Thread.sleep(5000);

            // Print metrics
            System.out.println("\n=== Queue Metrics ===");
            for (Map.Entry<String, TaskMetrics.MetricsSnapshot> entry : metrics.getAllSnapshots().entrySet()) {
                TaskMetrics.MetricsSnapshot snapshot = entry.getValue();
                System.out.printf("%s: enqueued=%d, successful=%d, failed=%d, retried=%d, avgTime=%.2fms%n",
                    entry.getKey(),
                    snapshot.enqueued(),
                    snapshot.successful(),
                    snapshot.failed(),
                    snapshot.retried(),
                    snapshot.averageProcessingTimeMs()
                );
            }

            queueService.stopProcessing();
        };
    }

    private void handleEmailTask(Task task) {
        Map<String, Object> payload = task.getPayload();
        System.out.printf("Sending email to %s: %s%n",
            payload.get("to"),
            payload.get("subject")
        );
        // Simulate processing
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void handleReportTask(Task task) {
        Map<String, Object> payload = task.getPayload();
        System.out.printf("Generating %s report for user %s%n",
            payload.get("reportType"),
            payload.get("userId")
        );
        // Simulate processing
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void handleNotificationTask(Task task) {
        Map<String, Object> payload = task.getPayload();
        System.out.printf("Pushing notification to user %s: %s%n",
            payload.get("userId"),
            payload.get("message")
        );
        // Simulate processing
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
