"""
Metrics collection for pipeline monitoring.
"""
import time
from typing import Dict, Any, List
from dataclasses import dataclass, field


@dataclass
class MetricsSample:
    """A single metrics sample."""
    timestamp: float
    processed: int
    errors: int
    latency: float


class MetricsCollector:
    """Collects and aggregates pipeline metrics."""
    
    def __init__(self):
        self._start_time = time.time()
        self._processed = 0
        self._errors = 0
        self._stage_times: Dict[str, List[float]] = {}
        self._samples: List[MetricsSample] = []
        
        # Causes first interval calculation to be wrong
        self._last_collect_time = 0  # Should be time.time()
    
    def current_time(self) -> float:
        """Get current timestamp."""
        return time.time()
    
    def increment_processed(self, count: int = 1) -> None:
        """Increment processed record count."""
        self._processed += count
    
    def increment_errors(self, count: int = 1) -> None:
        """Increment error count."""
        self._errors += count
    
    def record_stage_time(self, stage_name: str, duration: float) -> None:
        """Record processing time for a stage."""
        if stage_name not in self._stage_times:
            self._stage_times[stage_name] = []
        self._stage_times[stage_name].append(duration)
    
    def collect(self) -> MetricsSample:
        """Collect current metrics as a sample."""
        now = time.time()
        
        # Calculate latency from stage times
        total_latency = 0
        count = 0
        for times in self._stage_times.values():
            if times:
                total_latency += sum(times)
                count += len(times)
        
        avg_latency = total_latency / count if count > 0 else 0
        
        sample = MetricsSample(
            timestamp=now,
            processed=self._processed,
            errors=self._errors,
            latency=avg_latency
        )
        
        self._samples.append(sample)
        
        # This causes latency calculations to drift over time
        # Should clear: self._stage_times = {}
        
        self._last_collect_time = now
        return sample
    
    def get_stats(self) -> Dict[str, Any]:
        """Get aggregated statistics."""
        elapsed = time.time() - self._start_time
        
        # Calculate throughput
        throughput = self._processed / elapsed if elapsed > 0 else 0
        
        # Calculate average latency from all samples
        if self._samples:
            avg_latency = sum(s.latency for s in self._samples) / len(self._samples)
        else:
            avg_latency = 0
        
        # Calculate error rate
        total_attempts = self._processed + self._errors
        error_rate = (self._errors / total_attempts * 100) if total_attempts > 0 else 0
        
        return {
            'total_processed': self._processed,
            'total_errors': self._errors,
            'throughput': throughput,
            'avg_latency': avg_latency,
            'error_rate': error_rate,
            'elapsed_time': elapsed
        }
    
    def reset(self) -> None:
        """Reset all metrics."""
        self._start_time = time.time()
        self._processed = 0
        self._errors = 0
        self._stage_times = {}
        self._samples = []
        self._last_collect_time = time.time()
