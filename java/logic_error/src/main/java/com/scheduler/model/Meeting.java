package com.scheduler.model;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class Meeting {
    
    private String id;
    private String title;
    private String organizer;
    private List<String> attendees;
    private TimeSlot timeSlot;
    private String location;
    private MeetingStatus status;
    private int priority; // 1-5, higher is more important
    private boolean isRecurring;
    private RecurrencePattern recurrence;
    
    public Meeting() {
        this.id = UUID.randomUUID().toString();
        this.attendees = new ArrayList<>();
        this.status = MeetingStatus.SCHEDULED;
        this.priority = 3;
    }
    
    public Meeting(String title, String organizer, TimeSlot timeSlot) {
        this();
        this.title = title;
        this.organizer = organizer;
        this.timeSlot = timeSlot;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }
    
    public List<String> getAttendees() { return attendees; }
    public void setAttendees(List<String> attendees) { this.attendees = attendees; }
    
    public TimeSlot getTimeSlot() { return timeSlot; }
    public void setTimeSlot(TimeSlot timeSlot) { this.timeSlot = timeSlot; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    
    public boolean isRecurring() { return isRecurring; }
    public void setRecurring(boolean recurring) { isRecurring = recurring; }
    
    public RecurrencePattern getRecurrence() { return recurrence; }
    public void setRecurrence(RecurrencePattern recurrence) { this.recurrence = recurrence; }
    
    public void addAttendee(String attendee) {
        this.attendees.add(attendee);
    }
    
    public void removeAttendee(String attendee) {
        this.attendees.remove(attendee);
    }
    
    /**
     * Get the total number of participants (including organizer).
     */
    public int getTotalParticipants() {
        return attendees.size() + 1;
    }
    
    /**
     * Check if the meeting involves a specific person.
     */
    public boolean involves(String person) {
        return organizer.equals(person) || attendees.contains(person);
    }
    
    public Duration getDuration() {
        return timeSlot.getDuration();
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Meeting meeting = (Meeting) o;
        return Objects.equals(id, meeting.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "Meeting{" +
                "title='" + title + '\'' +
                ", timeSlot=" + timeSlot +
                ", attendees=" + attendees.size() +
                '}';
    }
}
