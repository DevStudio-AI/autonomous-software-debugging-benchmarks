"""
Data queue implementation for pipeline processing.
"""
from typing import List, Dict, Any, Optional
from collections import deque
import threading


class DataQueue:
    """Thread-safe queue for pipeline data."""
    
    def __init__(self, max_size: int = 10000):
        self._queue = deque(maxlen=max_size)
        self._lock = threading.Lock()
        self._processed_count = 0
    
    def put(self, item: Dict) -> None:
        """Add an item to the queue."""
        with self._lock:
            self._queue.append(item)
    
    def put_batch(self, items: List[Dict]) -> None:
        """Add multiple items to the queue."""
        with self._lock:
            self._queue.extend(items)
    
    def get(self) -> Optional[Dict]:
        """Get an item from the queue."""
        with self._lock:
            if self._queue:
                item = self._queue.popleft()
                self._processed_count += 1
                return item
            return None
    
    def get_batch(self, count: int) -> List[Dict]:
        """Get multiple items from the queue."""
        with self._lock:
            batch = []
            for _ in range(min(count, len(self._queue))):
                batch.append(self._queue.popleft())
                self._processed_count += 1
            return batch
    
    def size(self) -> int:
        """Get current queue size."""
        with self._lock:
            return len(self._queue)
    
    def processed_count(self) -> int:
        """Get total processed count."""
        return self._processed_count
    
    def clear(self) -> None:
        """Clear the queue."""
        with self._lock:
            self._queue.clear()
