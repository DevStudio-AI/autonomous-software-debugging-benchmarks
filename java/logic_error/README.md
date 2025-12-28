# Meeting Scheduler

## Difficulty: ⭐⭐⭐
## Pillar: Runtime Failures / Test Failures

A smart meeting scheduling service with availability detection, conflict resolution, and room suggestions.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.

### TimeSlot.java
- **Inverted overlap logic**: `overlaps()` method returns wrong result due to incorrect boolean logic
- **Boundary error in contains()**: End time check is exclusive when it should handle boundary correctly
- **Off-by-one in canFit()**: Uses `>` instead of `>=`, rejecting exact-fit slots
- **Missing validation in splitAt()**: Doesn't validate split time is within slot bounds

### Meeting.java
- **Double-counting participants**: `getTotalParticipants()` counts organizer even if they're in attendees list
- **Case sensitivity**: `involves()` uses case-sensitive comparison for emails

### SchedulerService.java
- **Date range exclusion**: Loop uses `isBefore()` instead of `!isAfter()`, excluding end date
- **Conflict detection inverted**: Relies on buggy `overlaps()` method
- **Reschedule race condition**: Doesn't remove old meeting before checking new slot conflicts
- **Room size off-by-one**: Boundary values assigned to wrong room sizes (4 people → "small" but small is "2-4")
- **Time averaging fails at boundaries**: Averaging 23:00 and 01:00 gives noon instead of midnight
- **Division by zero**: `calculateStats()` divides by meeting count without zero check
- **DST not handled**: Duration calculations ignore daylight saving transitions

## Symptoms

```java
// TimeSlot overlap returns wrong result
TimeSlot slot1 = new TimeSlot(time(10, 0), time(11, 0));
TimeSlot slot2 = new TimeSlot(time(10, 30), time(11, 30));
slot1.overlaps(slot2);  // Returns false! Should be true

// Exact-fit slots rejected
TimeSlot hourSlot = new TimeSlot(time(10, 0), time(11, 0));
hourSlot.canFit(Duration.ofHours(1));  // Returns false! Should be true

// End date excluded from search
findAvailableSlots(users, Jan1, Jan7, oneHour);  // Only searches Jan 1-6!

// Room suggestion wrong
suggestRoomSize(4);  // "Small Huddle Room (2-4 people)" - but 4 should get medium!

// Stats calculation crash
calculateStats(user, today, today);  // ArithmeticException: / by zero
```

## Expected Behavior

```java
// Correct overlap detection
slot1.overlaps(slot2);  // true when slots share any time

// Exact-fit slots accepted
hourSlot.canFit(Duration.ofHours(1));  // true

// Full date range included
findAvailableSlots(users, Jan1, Jan7, oneHour);  // Searches Jan 1-7 inclusive

// Room sizes match descriptions
suggestRoomSize(4);  // "Small Huddle Room" - 4 is at the boundary
suggestRoomSize(5);  // "Medium Conference Room"

// Stats handle empty case
calculateStats(user, today, today);  // Returns stats with 0 meetings
```

## Project Structure

```
src/main/java/com/scheduler/
├── Application.java
├── model/
│   ├── Meeting.java
│   ├── MeetingStatus.java
│   ├── RecurrencePattern.java
│   └── TimeSlot.java
└── service/
    └── SchedulerService.java
```

## Difficulty

⭐⭐⭐ (Intermediate) - Requires careful analysis of:
- Boolean logic and comparison operators
- Boundary conditions (off-by-one errors)
- Date/time handling edge cases
- Method contract expectations vs implementation

## What Makes This Realistic

Logic errors are among the hardest bugs to find:
- Code compiles and runs without errors
- Works correctly for many inputs
- Fails only at boundary conditions or specific scenarios
- Tests may pass if they don't cover edge cases
- Symptoms appear far from the actual bug location
