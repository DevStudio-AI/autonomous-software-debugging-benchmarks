"""
Task executor - runs individual tasks.
"""
import subprocess
import os
from typing import Optional

import sys
sys.path.insert(0, '..')
from models import Task, ExecutionResult, TaskStatus, ExecutionContext


class TaskExecutor:
    """Executes individual tasks."""
    
    def __init__(self, workspace: str):
        """
        Initialize the task executor.
        
        Args:
            workspace: Working directory for task execution
        """
        # This will cause issues when we try to use it
        self.workspace = workspace
        self.context = ExecutionContext(workspace=workspace)
    
    def execute(self, task: Task) -> ExecutionResult:
        """
        Execute a single task.
        
        Args:
            task: Task to execute
            
        Returns:
            ExecutionResult with status and output
        """
        retries = 0
        last_error = ""
        
        while retries <= task.retry_count:
            try:
                result = self._run_command(task.command, task.timeout)
                return ExecutionResult(
                    task_name=task.name,
                    status=TaskStatus.SUCCESS,
                    output=result,
                    retries_used=retries
                )
            except subprocess.TimeoutExpired as e:
                last_error = f"Task timed out after {task.timeout}s"
                retries += 1
            except subprocess.CalledProcessError as e:
                last_error = e.stderr if e.stderr else str(e)
                retries += 1
            except Exception as e:
                last_error = str(e)
                retries += 1
        
        return ExecutionResult(
            task_name=task.name,
            status=TaskStatus.FAILED,
            error=last_error,
            retries_used=retries
        )
    
    def _run_command(self, command: str, timeout: Optional[int]) -> str:
        """
        Run a shell command.
        
        Args:
            command: Command to execute
            timeout: Timeout in seconds (None for no timeout)
            
        Returns:
            Command output
        """
        # os.path.join with None creates issues
        working_dir = os.path.join(self.workspace, "tasks") if self.workspace else None
        
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=working_dir if working_dir and os.path.exists(working_dir) else None
        )
        
        if result.returncode != 0:
            raise subprocess.CalledProcessError(
                result.returncode,
                command,
                result.stdout,
                result.stderr
            )
        
        return result.stdout.strip()
    
    def dry_run(self, task: Task) -> ExecutionResult:
        """
        Simulate task execution without running.
        
        Args:
            task: Task to simulate
            
        Returns:
            ExecutionResult with simulated success
        """
        return ExecutionResult(
            task_name=task.name,
            status=TaskStatus.SUCCESS,
            output=f"[DRY RUN] Would execute: {task.command}"
        )
