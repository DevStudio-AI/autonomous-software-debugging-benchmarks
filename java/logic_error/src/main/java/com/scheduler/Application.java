package com.scheduler;

import com.scheduler.model.*;
import com.scheduler.service.SchedulerService;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class Application {
    
    public static void main(String[] args) {
        SchedulerService scheduler = new SchedulerService();
        
        // Demo: Find available slots
        List<String> participants = Arrays.asList("alice@company.com", "bob@company.com");
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        
        System.out.println("Finding available 1-hour slots for the next week...");
        List<TimeSlot> slots = scheduler.findAvailableSlots(
            participants, 
            today, 
            nextWeek,
            Duration.ofHours(1)
        );
        
        System.out.println("Found " + slots.size() + " available slots:");
        slots.stream().limit(5).forEach(System.out::println);
        
        // Demo: Schedule a meeting
        TimeSlot meetingTime = new TimeSlot(
            LocalDateTime.of(today.plusDays(1), LocalTime.of(10, 0)),
            Duration.ofMinutes(60)
        );
        
        Meeting meeting = new Meeting("Project Kickoff", "alice@company.com", meetingTime);
        meeting.addAttendee("bob@company.com");
        meeting.addAttendee("charlie@company.com");
        
        if (scheduler.scheduleMeeting(meeting)) {
            System.out.println("\nScheduled: " + meeting);
        } else {
            System.out.println("\nConflict detected!");
        }
        
        // Demo: Room suggestion
        System.out.println("\nRoom suggestion for " + meeting.getTotalParticipants() + 
                          " participants: " + scheduler.suggestRoomSize(meeting.getTotalParticipants()));
        
        // Demo: Suggest meeting time
        List<LocalTime> preferences = Arrays.asList(
            LocalTime.of(9, 30),
            LocalTime.of(10, 0),
            LocalTime.of(14, 0)
        );
        System.out.println("\nSuggested meeting time: " + scheduler.suggestMeetingTime(preferences));
        
        // Demo: Calculate stats (will throw if no meetings scheduled)
        try {
            SchedulerService.MeetingStats stats = scheduler.calculateStats(
                "alice@company.com",
                today,
                today.plusDays(7)
            );
            System.out.println("\nMeeting stats: " + stats);
        } catch (ArithmeticException e) {
            System.out.println("\nError calculating stats: " + e.getMessage());
        }
    }
}
