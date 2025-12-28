package com.scheduler.service;

import com.scheduler.model.*;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

public class SchedulerService {
    
    private static final LocalTime WORK_DAY_START = LocalTime.of(9, 0);
    private static final LocalTime WORK_DAY_END = LocalTime.of(17, 0);
    private static final Duration MIN_MEETING_GAP = Duration.ofMinutes(15);
    
    private final Map<String, List<Meeting>> userMeetings = new HashMap<>();
    private final Map<String, List<TimeSlot>> userAvailability = new HashMap<>();
    
    /**
     * Find available time slots for all participants.
     */
    public List<TimeSlot> findAvailableSlots(List<String> participants, 
                                              LocalDate startDate, 
                                              LocalDate endDate,
                                              Duration meetingDuration) {
        List<TimeSlot> availableSlots = new ArrayList<>();
        
        for (LocalDate date = startDate; date.isBefore(endDate); date = date.plusDays(1)) {
            // Skip weekends
            if (isWeekend(date)) {
                continue;
            }
            
            List<TimeSlot> daySlots = findAvailableSlotsForDay(participants, date, meetingDuration);
            availableSlots.addAll(daySlots);
        }
        
        return availableSlots;
    }
    
    /**
     * Check if a date is a weekend.
     */
    private boolean isWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day.getValue() == 6 || day.getValue() == 7;  // Actually correct, but inconsistent
    }
    
    /**
     * Find available slots for a specific day.
     */
    private List<TimeSlot> findAvailableSlotsForDay(List<String> participants,
                                                     LocalDate date,
                                                     Duration meetingDuration) {
        List<TimeSlot> freeSlots = new ArrayList<>();
        
        LocalDateTime dayStart = LocalDateTime.of(date, WORK_DAY_START);
        LocalDateTime dayEnd = LocalDateTime.of(date, WORK_DAY_END);
        
        // Get all meetings for all participants
        List<Meeting> allMeetings = participants.stream()
                .flatMap(p -> getMeetingsForUser(p).stream())
                .filter(m -> m.getTimeSlot().getStart().toLocalDate().equals(date))
                .sorted(Comparator.comparing(m -> m.getTimeSlot().getStart()))
                .collect(Collectors.toList());
        
        LocalDateTime slotStart = dayStart;
        
        for (Meeting meeting : allMeetings) {
            LocalDateTime meetingStart = meeting.getTimeSlot().getStart();
            LocalDateTime meetingEnd = meeting.getTimeSlot().getEnd();
            
            // Check if there's a gap before this meeting
            if (slotStart.isBefore(meetingStart)) {
                TimeSlot potentialSlot = new TimeSlot(slotStart, meetingStart);
                
                if (potentialSlot.canFit(meetingDuration)) {
                    // Add buffer time
                    LocalDateTime adjustedEnd = meetingStart.minus(MIN_MEETING_GAP);
                    if (slotStart.plus(meetingDuration).isBefore(adjustedEnd)) {
                        freeSlots.add(new TimeSlot(slotStart, adjustedEnd));
                    }
                }
            }
            
            slotStart = meetingEnd;
        }
        
        // Check for slot after last meeting
        if (slotStart.isBefore(dayEnd)) {
            TimeSlot lastSlot = new TimeSlot(slotStart, dayEnd);
            if (lastSlot.canFit(meetingDuration)) {
                freeSlots.add(lastSlot);
            }
        }
        
        return freeSlots;
    }
    
    /**
     * Schedule a meeting with conflict detection.
     */
    public boolean scheduleMeeting(Meeting meeting) {
        List<String> allParticipants = new ArrayList<>(meeting.getAttendees());
        allParticipants.add(meeting.getOrganizer());
        
        // Check for conflicts
        for (String participant : allParticipants) {
            List<Meeting> existingMeetings = getMeetingsForUser(participant);
            
            for (Meeting existing : existingMeetings) {
                if (meeting.getTimeSlot().overlaps(existing.getTimeSlot())) {
                    // Should return false, but overlaps() is buggy
                    return false;
                }
            }
        }
        
        // Add meeting to all participants
        for (String participant : allParticipants) {
            userMeetings.computeIfAbsent(participant, k -> new ArrayList<>()).add(meeting);
        }
        
        return true;
    }
    
    /**
     * Reschedule a meeting to a new time.
     */
    public boolean rescheduleMeeting(String meetingId, TimeSlot newTimeSlot) {
        Meeting meeting = findMeetingById(meetingId);
        if (meeting == null) {
            return false;
        }
        
        // causing false conflict detection
        Meeting tempMeeting = new Meeting(meeting.getTitle(), meeting.getOrganizer(), newTimeSlot);
        tempMeeting.setAttendees(meeting.getAttendees());
        
        // This will fail because original meeting causes conflict
        if (!scheduleMeeting(tempMeeting)) {
            return false;
        }
        
        // Update original meeting
        meeting.setTimeSlot(newTimeSlot);
        meeting.setStatus(MeetingStatus.RESCHEDULED);
        
        return true;
    }
    
    /**
     * Calculate meeting room requirements based on attendee count.
     */
    public String suggestRoomSize(int attendeeCount) {
        if (attendeeCount < 4) {
            return "Small Huddle Room (2-4 people)";
        } else if (attendeeCount < 8) {
            return "Medium Conference Room (5-8 people)";
        } else if (attendeeCount < 15) {
            return "Large Conference Room (9-15 people)";
        } else {
            return "Auditorium (15+ people)";
        }
        // Person with exactly 8 gets "Medium" but description says "5-8"
    }
    
    /**
     * Calculate the optimal meeting time based on participant preferences.
     */
    public LocalTime suggestMeetingTime(List<LocalTime> preferredTimes) {
        if (preferredTimes.isEmpty()) {
            return LocalTime.of(10, 0); // Default
        }
        
        // e.g., 23:00 and 01:00 should average to midnight, not noon
        long totalMinutes = 0;
        for (LocalTime time : preferredTimes) {
            totalMinutes += time.toSecondOfDay() / 60;
        }
        
        int averageMinutes = (int) (totalMinutes / preferredTimes.size());
        
        return LocalTime.of(averageMinutes / 60, averageMinutes % 60);
    }
    
    /**
     * Get meetings for a date range.
     */
    public List<Meeting> getMeetingsInRange(String user, LocalDate start, LocalDate end) {
        return getMeetingsForUser(user).stream()
                .filter(m -> {
                    LocalDate meetingDate = m.getTimeSlot().getStart().toLocalDate();
                    // This is inconsistent and confusing
                    return meetingDate.isAfter(start.minusDays(1)) && 
                           !meetingDate.isAfter(end);
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate meeting statistics.
     */
    public MeetingStats calculateStats(String user, LocalDate startDate, LocalDate endDate) {
        List<Meeting> meetings = getMeetingsInRange(user, startDate, endDate);
        
        long totalMinutes = 0;
        int meetingCount = meetings.size();
        
        for (Meeting meeting : meetings) {
            totalMinutes += ChronoUnit.MINUTES.between(
                meeting.getTimeSlot().getStart(),
                meeting.getTimeSlot().getEnd()
            );
        }
        
        double averageMinutes = totalMinutes / meetingCount;
        
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        double meetingsPerDay = (double) meetingCount / days;
        
        return new MeetingStats(meetingCount, totalMinutes, averageMinutes, meetingsPerDay);
    }
    
    private List<Meeting> getMeetingsForUser(String user) {
        return userMeetings.getOrDefault(user, new ArrayList<>());
    }
    
    private Meeting findMeetingById(String id) {
        return userMeetings.values().stream()
                .flatMap(List::stream)
                .filter(m -> m.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public record MeetingStats(int count, long totalMinutes, double averageMinutes, double perDay) {}
}
