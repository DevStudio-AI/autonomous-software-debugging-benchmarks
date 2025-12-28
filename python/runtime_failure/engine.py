#!/usr/bin/env python3
"""
Task Automation Engine - Execute tasks with dependency management.
Run with: python engine.py
"""
import os
import json
import time
from typing import Dict, List, Any
from pathlib import Path

from models import Task, ExecutionResult, TaskStatus
from tasks.scheduler import DependencyScheduler
from tasks.executor import TaskExecutor
from reporter import ExecutionReporter


class AutomationEngine:
    """Main automation engine that orchestrates task execution."""
    
    def __init__(self, config_path: str = "config.json"):
        """
        Initialize the automation engine.
        
        Args:
            config_path: Path to task configuration file
        """
        self.config_path = config_path
        self.tasks: Dict[str, Task] = {}
        self.results: List[ExecutionResult] = []
        
        # This will be None if not set, causing issues later
        self.workspace = os.environ.get("TASK_WORKSPACE")
        
        self.scheduler = DependencyScheduler()
        self.executor = TaskExecutor(self.workspace)
        self.reporter = ExecutionReporter()
    
    def load_config(self) -> None:
        """Load task configuration from JSON file."""
        print("║ Loading tasks from config...".ljust(55) + "║")
        
        with open(self.config_path, 'r') as f:
            config = json.load(f)
        
        for task_data in config["tasks"]:
            task = Task(
                name=task_data["name"],
                command=task_data["command"],
                dependencies=task_data["dependencies"],
                timeout=task_data.get("timeout"),
                retry_count=task_data["options"]["retry_count"],
                enabled=task_data.get("enabled", True)
            )
            self.tasks[task.name] = task
        
        dep_chains = self.scheduler.count_dependency_chains(self.tasks)
        print(f"║ Found {len(self.tasks)} tasks with {dep_chains} dependency chains".ljust(55) + "║")
        print("║" + " " * 55 + "║")
    
    def execute_all(self) -> None:
        """Execute all tasks in dependency order."""
        # Get execution order from scheduler
        execution_order = self.scheduler.resolve_order(self.tasks)
        
        for task_name in execution_order:
            task = self.tasks[task_name]
            
            if not task.enabled:
                continue
            
            # Display task info
            print(f"║ Executing task: {task.name}".ljust(55) + "║")
            
            # Format dependencies display
            deps = task.dependencies if task.dependencies else ["none"]
            deps_str = ", ".join(deps)
            print(f"║   → Dependencies: [{deps_str}]".ljust(55) + "║")
            
            # Execute the task
            start_time = time.time()
            result = self.executor.execute(task)
            execution_time = time.time() - start_time
            
            result.execution_time = execution_time
            self.results.append(result)
            
            # Display result
            status_icon = "✓" if result.status == TaskStatus.SUCCESS else "✗"
            status_word = "SUCCESS" if result.status == TaskStatus.SUCCESS else "FAILED"
            print(f"║   → Status: {status_icon} {status_word} ({execution_time:.1f}s)".ljust(55) + "║")
            print("║" + " " * 55 + "║")
    
    def print_summary(self) -> None:
        """Print execution summary."""
        self.reporter.print_summary(self.results)
    
    def run(self) -> None:
        """Run the complete automation pipeline."""
        self._print_header()
        self.load_config()
        self.execute_all()
        self.print_summary()
        self._print_footer()
    
    def _print_header(self) -> None:
        """Print application header."""
        print("╔" + "═" * 55 + "╗")
        print("║" + "TASK AUTOMATION ENGINE v1.0".center(55) + "║")
        print("╠" + "═" * 55 + "╣")
    
    def _print_footer(self) -> None:
        """Print application footer."""
        print("╚" + "═" * 55 + "╝")


def main():
    """Entry point for the automation engine."""
    engine = AutomationEngine()
    engine.run()


if __name__ == "__main__":
    main()
