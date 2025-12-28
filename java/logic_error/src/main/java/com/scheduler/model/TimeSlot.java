package com.scheduler.model;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Objects;

public class TimeSlot {
    
    private LocalDateTime start;
    private LocalDateTime end;
    
    public TimeSlot(LocalDateTime start, LocalDateTime end) {
        this.start = start;
        this.end = end;
    }
    
    public TimeSlot(LocalDateTime start, Duration duration) {
        this.start = start;
        this.end = start.plus(duration);
    }
    
    public LocalDateTime getStart() { return start; }
    public void setStart(LocalDateTime start) { this.start = start; }
    
    public LocalDateTime getEnd() { return end; }
    public void setEnd(LocalDateTime end) { this.end = end; }
    
    public Duration getDuration() {
        return Duration.between(start, end);
    }
    
    /**
     * Check if this time slot overlaps with another.
     * This means adjacent slots are incorrectly considered overlapping
     */
    public boolean overlaps(TimeSlot other) {
        // Using isAfter incorrectly causes edge case failures
        return !this.end.isAfter(other.start) && !other.end.isAfter(this.start);
    }
    
    /**
     * Check if this slot contains the given time.
     */
    public boolean contains(LocalDateTime time) {
        return !time.isBefore(start) && time.isBefore(end);
    }
    
    /**
     * Check if this slot can accommodate a meeting of the given duration.
     */
    public boolean canFit(Duration meetingDuration) {
        Duration slotDuration = getDuration();
        return slotDuration.toMinutes() > meetingDuration.toMinutes();
    }
    
    /**
     * Split this slot at the given time.
     */
    public TimeSlot[] splitAt(LocalDateTime splitTime) {
        return new TimeSlot[] {
            new TimeSlot(start, splitTime),
            new TimeSlot(splitTime, end)
        };
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimeSlot timeSlot = (TimeSlot) o;
        return Objects.equals(start, timeSlot.start) && Objects.equals(end, timeSlot.end);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(start, end);
    }
    
    @Override
    public String toString() {
        return "TimeSlot{" + start + " - " + end + "}";
    }
}
