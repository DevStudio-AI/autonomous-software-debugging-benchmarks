"""
Data models for the task automation engine.
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional
from datetime import datetime


class TaskStatus(Enum):
    """Task execution status."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class Task:
    """Represents a task to be executed."""
    name: str
    command: str
    dependencies: List[str] = field(default_factory=list)
    timeout: Optional[int] = None
    retry_count: int = 1
    enabled: bool = True
    
    def __hash__(self):
        return hash(self.name)
    
    def __eq__(self, other):
        if isinstance(other, Task):
            return self.name == other.name
        return False


@dataclass
class ExecutionResult:
    """Result of a task execution."""
    task_name: str
    status: TaskStatus
    output: str = ""
    error: str = ""
    execution_time: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    retries_used: int = 0
    
    @property
    def succeeded(self) -> bool:
        """Check if execution was successful."""
        return self.status == TaskStatus.SUCCESS


@dataclass
class ExecutionContext:
    """Context information for task execution."""
    workspace: str
    environment: dict = field(default_factory=dict)
    dry_run: bool = False
