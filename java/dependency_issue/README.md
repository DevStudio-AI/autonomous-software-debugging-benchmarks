# Task Queue Manager

## Difficulty: ⭐⭐⭐
## Pillar: Configuration & Infra

A distributed task queue system using Redis as the backend, with Spring Boot framework.

## The Bug

The project contains bugs that cause the symptoms described below. The debugging system must identify and fix these issues.

- **Spring version mismatch**: Spring Boot 3.2.0 with Spring Data Redis 2.7.5 (incompatible)
- **Jackson version conflict**: Explicit older Jackson version conflicts with Spring Boot's managed version
- **Guava too old**: Version 19.0 missing `Streams.stream()` method (added in Guava 21)
- **Missing dependency**: `jakarta.annotation-api` required for `@PostConstruct`/`@PreDestroy`
- **SLF4J conflict**: Both `slf4j-simple` and `logback-classic` provide SLF4J bindings
- **Mockito version**: 3.12.4 has issues with Java 17 due to reflection restrictions
- **Maven compiler plugin**: Version 3.8.0 predates proper Java 17 support

## Symptoms

```bash
$ mvn clean compile

[ERROR] error: package javax.annotation does not exist
import javax.annotation.PostConstruct;
                       ^

$ mvn spring-boot:run

java.lang.NoSuchMethodError: 'java.util.stream.Stream com.google.common.collect.Streams.stream(java.util.Iterator)'
    at com.taskqueue.repository.TaskRepository.findByQueue(TaskRepository.java:67)

SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/.../slf4j-simple-1.7.36.jar]
SLF4J: Found binding in [jar:file:/.../logback-classic-1.4.11.jar]

java.lang.NoClassDefFoundError: org/springframework/data/redis/connection/RedisConnection
```

## Expected Behavior

When dependencies are correctly configured:

```bash
$ mvn clean spring-boot:run

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

Redis connection established
Registered handler for task: email.send
Registered handler for task: report.generate
Registered handler for task: notification.push
Started processing queues: emails, reports, notifications
Sending email to user@example.com: Welcome!
Generating monthly report for user 12345
Pushing notification to user 12345: Your report is ready!
```

## Project Structure

```
src/main/java/com/taskqueue/
├── Application.java
├── config/
│   └── RedisConfig.java
├── model/
│   ├── Task.java
│   └── TaskStatus.java
├── repository/
│   └── TaskRepository.java
├── service/
│   └── QueueService.java
└── util/
    └── TaskMetrics.java
```

## Difficulty

⭐⭐⭐⭐ (Advanced) - Requires understanding of:
- Maven dependency resolution and version conflicts
- Spring Boot dependency management
- Java module system and annotation processing
- SLF4J binding resolution
- API compatibility across library versions

## What Makes This Realistic

Dependency conflicts are among the most common Java issues:
- Spring Boot version doesn't match explicit Spring library versions
- Old Guava version missing newer API methods
- Multiple logging framework bindings on classpath
- Missing annotation processor dependencies for Java 17+
- Copy-pasting dependencies from different project versions
