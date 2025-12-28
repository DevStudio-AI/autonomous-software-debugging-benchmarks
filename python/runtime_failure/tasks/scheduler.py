"""
Dependency scheduler - resolves task execution order.
"""
from typing import Dict, List, Set
from collections import deque

import sys
sys.path.insert(0, '..')
from models import Task


class DependencyScheduler:
    """Resolves task dependencies and determines execution order."""
    
    def resolve_order(self, tasks: Dict[str, Task]) -> List[str]:
        """
        Resolve task execution order using topological sort.
        
        Args:
            tasks: Dictionary of task name to Task object
            
        Returns:
            List of task names in execution order
        """
        # Build dependency graph
        in_degree: Dict[str, int] = {}
        graph: Dict[str, List[str]] = {}
        
        for name, task in tasks.items():
            if name not in in_degree:
                in_degree[name] = 0
            if name not in graph:
                graph[name] = []
            
            for dep in task.dependencies:
                if dep not in graph:
                    graph[dep] = []
                graph[dep].append(name)
                # reference tasks not in the main task dict
                in_degree[name] += 1
        
        # Kahn's algorithm for topological sort
        queue = deque([name for name, degree in in_degree.items() if degree == 0])
        result = []
        
        while queue:
            current = queue.popleft()
            result.append(current)
            
            for neighbor in graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        # Check for cycles
        if len(result) != len(tasks):
            raise ValueError("Circular dependency detected in task configuration")
        
        return result
    
    def count_dependency_chains(self, tasks: Dict[str, Task]) -> int:
        """
        Count the number of independent dependency chains.
        
        Args:
            tasks: Dictionary of task name to Task object
            
        Returns:
            Number of dependency chains
        """
        visited: Set[str] = set()
        chains = 0
        
        def dfs(task_name: str) -> None:
            if task_name in visited:
                return
            visited.add(task_name)
            
            task = tasks.get(task_name)
            for dep in task.dependencies:
                dfs(dep)
        
        # Find root tasks (no dependencies) and count chains
        for name, task in tasks.items():
            if not task.dependencies and name not in visited:
                chains += 1
                dfs(name)
        
        return max(chains, 1)  # At least 1 chain
    
    def validate_dependencies(self, tasks: Dict[str, Task]) -> List[str]:
        """
        Validate that all dependencies exist.
        
        Args:
            tasks: Dictionary of task name to Task object
            
        Returns:
            List of missing dependency names
        """
        missing = []
        task_names = set(tasks.keys())
        
        for task in tasks.values():
            for dep in task.dependencies:
                if dep not in task_names:
                    missing.append(dep)
        
        return missing
