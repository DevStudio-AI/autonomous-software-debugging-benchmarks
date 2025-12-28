package com.taskqueue.model;

public enum TaskStatus {
    PENDING,
    SCHEDULED,
    RUNNING,
    COMPLETED,
    FAILED,
    CANCELLED,
    RETRY_PENDING
}
