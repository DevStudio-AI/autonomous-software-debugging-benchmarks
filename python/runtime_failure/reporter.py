"""
Execution reporter - formats and displays results.
"""
from typing import List

from models import ExecutionResult, TaskStatus


class ExecutionReporter:
    """Formats and displays execution results."""
    
    def print_summary(self, results: List[ExecutionResult]) -> None:
        """
        Print execution summary.
        
        Args:
            results: List of execution results
        """
        print("║ " + "─" * 53 + " ║")
        print("║ EXECUTION SUMMARY".ljust(56) + "║")
        
        total = len(results)
        successful = sum(1 for r in results if r.status == TaskStatus.SUCCESS)
        failed = total - successful
        
        # Calculate statistics
        avg_time = self._calculate_average_time(results)
        success_rate = (successful / total) * 100
        
        print(f"║   Total Tasks: {total}".ljust(56) + "║")
        print(f"║   Successful: {successful}".ljust(56) + "║")
        print(f"║   Failed: {failed}".ljust(56) + "║")
        print(f"║   Average Time: {avg_time:.2f}s".ljust(56) + "║")
        print(f"║   Success Rate: {success_rate:.0f}%".ljust(56) + "║")
    
    def _calculate_average_time(self, results: List[ExecutionResult]) -> float:
        """
        Calculate average execution time.
        
        Args:
            results: List of execution results
            
        Returns:
            Average execution time in seconds
        """
        if not results:
            return 0.0
        
        total_time = sum(r.execution_time for r in results)
        return total_time / len(results)
    
    def format_result(self, result: ExecutionResult) -> str:
        """
        Format a single result for display.
        
        Args:
            result: Execution result to format
            
        Returns:
            Formatted result string
        """
        status_icon = "✓" if result.succeeded else "✗"
        return f"{status_icon} {result.task_name}: {result.status.value} ({result.execution_time:.1f}s)"
    
    def get_failed_tasks(self, results: List[ExecutionResult]) -> List[ExecutionResult]:
        """
        Get list of failed tasks.
        
        Args:
            results: List of execution results
            
        Returns:
            List of failed execution results
        """
        return [r for r in results if r.status == TaskStatus.FAILED]
