"""
Metrics reporting and visualization.
"""
from typing import Dict, Any, List
from metrics.collector import MetricsSample


class MetricsReporter:
    """Formats and reports metrics data."""
    
    def __init__(self):
        self._history: List[Dict] = []
    
    def format_summary(self, stats: Dict[str, Any]) -> str:
        """Format statistics as a summary string."""
        lines = [
            f"Records Processed: {stats.get('total_processed', 0):,}",
            f"Throughput: {stats.get('throughput', 0):.1f} rec/sec",
            f"Avg Latency: {stats.get('avg_latency', 0)*1000:.0f}ms",
            f"Error Rate: {stats.get('error_rate', 0):.1f}%",
        ]
        return "\n".join(lines)
    
    def format_progress_bar(self, current: int, total: int, width: int = 20) -> str:
        """Format a progress bar."""
        if total == 0:
            return "░" * width
        
        progress = current / total
        filled = int(width * progress)
        return "█" * filled + "░" * (width - filled)
    
    def format_stage_status(self, stage_name: str, status: str = "complete") -> str:
        """Format stage status for display."""
        icon = "✓" if status == "complete" else "●" if status == "running" else "○"
        return f"{icon} {stage_name}"
    
    def record_snapshot(self, stats: Dict[str, Any]) -> None:
        """Record a metrics snapshot for history."""
        self._history.append(stats.copy())
    
    def get_trend(self, metric: str, samples: int = 10) -> List[float]:
        """Get trend data for a metric."""
        recent = self._history[-samples:] if len(self._history) >= samples else self._history
        return [h.get(metric, 0) for h in recent]
    
    def calculate_health_score(self, stats: Dict[str, Any]) -> float:
        """
        Calculate overall health score (0-100).
        
        Factors:
        - Error rate (lower is better)
        - Throughput vs baseline
        - Latency vs baseline
        """
        error_score = max(0, 100 - stats.get('error_rate', 0) * 10)
        
        # Assume baseline throughput of 10 rec/sec
        throughput = stats.get('throughput', 0)
        throughput_score = min(100, throughput * 10)
        
        # Assume baseline latency of 100ms
        latency = stats.get('avg_latency', 0) * 1000  # Convert to ms
        latency_score = max(0, 100 - latency)
        
        # Weighted average
        health = (error_score * 0.5) + (throughput_score * 0.3) + (latency_score * 0.2)
        return round(health, 1)
