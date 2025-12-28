#!/usr/bin/env python3
"""
Data Pipeline Monitor - Process and monitor data records.
Run with: python monitor.py
"""
import time
import sys
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime

from pipeline.stages import PipelineStage, IngestionStage, ValidationStage, TransformStage, OutputStage
from pipeline.queue import DataQueue
from metrics.collector import MetricsCollector
from metrics.reporter import MetricsReporter
from data.generator import generate_test_records


@dataclass
class PipelineConfig:
    """Configuration for the data pipeline."""
    batch_size: int = 100
    num_records: int = 1000
    collect_interval: float = 1.0  # seconds


class DataPipelineMonitor:
    """Main pipeline monitor that orchestrates data processing."""
    
    def __init__(self, config: PipelineConfig = None):
        """Initialize the pipeline monitor."""
        self.config = config or PipelineConfig()
        
        # Initialize components
        self.queue = DataQueue()
        self.metrics = MetricsCollector()
        self.reporter = MetricsReporter()
        
        # Initialize stages
        self.stages: List[PipelineStage] = [
            IngestionStage(self.metrics),
            ValidationStage(self.metrics),
            TransformStage(self.metrics),
            OutputStage(self.metrics),
        ]
        
        # Processing state
        self.processed_records: List[Dict] = []
        self.record_cache: Dict[str, Any] = {}
        self.start_time = None
    
    def run(self) -> None:
        """Run the complete pipeline."""
        self._print_header()
        
        # Generate test data
        records = generate_test_records(self.config.num_records)
        print(f"║  Generated {len(records)} test records".ljust(57) + "║")
        print("║" + " " * 57 + "║")
        
        self.start_time = time.time()
        
        # Process in batches
        total_batches = (len(records) + self.config.batch_size - 1) // self.config.batch_size
        
        for batch_idx in range(total_batches):
            # This causes the last record of each batch to be skipped
            start = batch_idx * self.config.batch_size
            end = start + self.config.batch_size - 1
            
            batch = records[start:end]
            self._process_batch(batch, batch_idx + 1, total_batches)
            
            # Collect metrics
            self.metrics.collect()
            
            time.sleep(0.1)
        
        self._print_results()
        self._print_footer()
    
    def _process_batch(self, batch: List[Dict], batch_num: int, total: int) -> None:
        """Process a batch of records through all stages."""
        # Show progress
        progress = int((batch_num / total) * 20)
        bar = "█" * progress + "░" * (20 - progress)
        print(f"\r║  Processing batch {batch_num}/{total} [{bar}]".ljust(57) + "║", end="")
        
        current_batch = batch
        
        for stage in self.stages:
            # Process through stage
            stage_start = time.time()
            current_batch = stage.process(current_batch)
            stage_time = time.time() - stage_start
            
            for record in current_batch:
                self.record_cache[record.get('id', str(id(record)))] = record
            
            # Track stage metrics
            self.metrics.record_stage_time(stage.name, stage_time)
        
        # Add to processed
        self.processed_records.extend(current_batch)
        
        # not by actual records processed (which may be fewer due to filtering)
        self.metrics.increment_processed(len(batch))  # Should be len(current_batch)
    
    def _print_header(self) -> None:
        """Print application header."""
        print("╔" + "═" * 57 + "╗")
        print("║" + "DATA PIPELINE MONITOR v2.0".center(57) + "║")
        print("╠" + "═" * 57 + "╣")
        print("║" + " " * 57 + "║")
    
    def _print_results(self) -> None:
        """Print processing results."""
        print()  # New line after progress
        print("║" + " " * 57 + "║")
        
        elapsed = time.time() - self.start_time
        throughput = len(self.processed_records) / elapsed if elapsed > 0 else 0
        
        # Get metrics
        stats = self.metrics.get_stats()
        
        # Check health
        # vs actual records (correct), causing false "data loss" reports
        expected = self.config.num_records
        actual_processed = stats.get('total_processed', 0)
        
        if actual_processed >= expected:
            status = "● HEALTHY"
            status_color = ""
        else:
            status = "● DEGRADED"
            status_color = ""
        
        print(f"║  PIPELINE STATUS: {status}".ljust(57) + "║")
        print("║" + " " * 57 + "║")
        
        # Stage progress
        for stage in self.stages:
            print(f"║  Stage: {stage.name:<12} [████████████████████] 100%".ljust(57) + "║")
        
        print("║" + " " * 57 + "║")
        print("║  METRICS (last 60s):".ljust(57) + "║")
        print(f"║  ├─ Records Processed: {actual_processed:,}".ljust(57) + "║")
        print(f"║  ├─ Throughput: {throughput:.1f} rec/sec".ljust(57) + "║")
        print(f"║  ├─ Avg Latency: {stats.get('avg_latency', 0)*1000:.0f}ms".ljust(57) + "║")
        print(f"║  ├─ Error Rate: {stats.get('error_rate', 0):.1f}%".ljust(57) + "║")
        print(f"║  └─ Memory: {len(self.record_cache) * 0.001:.0f} MB (cache entries)".ljust(57) + "║")
        print("║" + " " * 57 + "║")
        
        # Final status
        actual_output = len(self.processed_records)
        if actual_output == expected:
            print(f"║  All {expected:,} input records successfully processed.".ljust(57) + "║")
        else:
            print(f"║  WARNING: {expected - actual_output} records lost in pipeline!".ljust(57) + "║")
    
    def _print_footer(self) -> None:
        """Print application footer."""
        print("╚" + "═" * 57 + "╝")


def main():
    """Entry point for the pipeline monitor."""
    config = PipelineConfig(
        batch_size=100,
        num_records=1000,
        collect_interval=1.0
    )
    
    monitor = DataPipelineMonitor(config)
    monitor.run()


if __name__ == "__main__":
    main()
