# Data Pipeline Monitor - Hypothesis-Driven Debugging

## Difficulty: ⭐⭐⭐⭐⭐
## Pillar: Hypothesis-Driven Debugging (Your Secret Weapon)

## What This Project Does (When Fixed)

A real-time data pipeline monitor that:
- Processes incoming data records from multiple sources
- Validates and transforms data through a multi-stage pipeline
- Tracks processing metrics (throughput, latency, errors)
- Generates health reports with anomaly detection

## The Challenge

This project is **intentionally ambiguous**. The symptoms don't point clearly to one cause.

### Observed Symptoms

When running `python monitor.py`:

1. **Intermittent failures**: Sometimes it works, sometimes it doesn't
2. **Metric inconsistencies**: Reported throughput doesn't match actual processing
3. **Memory growth**: Process memory increases over time
4. **Data loss**: Some records disappear between stages
5. **Performance degradation**: Gets slower as it runs

### The Ambiguity

These symptoms could be caused by:
- **Race conditions** in the async processing
- **Memory leaks** in data caching
- **Off-by-one errors** in batch processing
- **State corruption** from shared mutable data
- **Timer drift** in metric collection
- **Resource exhaustion** from unclosed handlers

**The debugger must:**
1. Generate hypotheses for each symptom
2. Gather evidence (run code, inspect state, add logging)
3. Rule out alternatives
4. Assign confidence scores
5. Choose the fix with highest confidence
6. Justify the decision

## Expected Success State

```
╔══════════════════════════════════════════════════════════╗
║             DATA PIPELINE MONITOR v2.0                   ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  PIPELINE STATUS: ● HEALTHY                              ║
║                                                          ║
║  Stage: Ingestion    [████████████████████] 100%         ║
║  Stage: Validation   [████████████████████] 100%         ║
║  Stage: Transform    [████████████████████] 100%         ║
║  Stage: Output       [████████████████████] 100%         ║
║                                                          ║
║  METRICS (last 60s):                                     ║
║  ├─ Records Processed: 1,000                             ║
║  ├─ Throughput: 16.7 rec/sec                            ║
║  ├─ Avg Latency: 45ms                                    ║
║  ├─ Error Rate: 0.0%                                     ║
║  └─ Memory: 45 MB (stable)                              ║
║                                                          ║
║  All 1,000 input records successfully processed.         ║
╚══════════════════════════════════════════════════════════╝
```

## How to Verify Success

```bash
python monitor.py

# Should complete with:
# - All records processed (no data loss)
# - Consistent metrics
# - Stable memory usage
# - No performance degradation
```

## Debugging Approach Expected

A capable debugger should:

1. **Form hypotheses**
   - H1: Race condition in async queue
   - H2: Memory leak in cache
   - H3: Batch boundary bug
   - H4: Metric counter drift
   
2. **Gather evidence**
   - Add strategic logging
   - Monitor memory allocation
   - Trace record flow
   - Compare counters at each stage

3. **Score and decide**
   - H1: Low confidence (no concurrent access found)
   - H2: High confidence (cache never clears)
   - H3: Medium confidence (boundary off-by-one exists)
   - H4: Medium confidence (timer accumulation drift)

4. **Fix with justification**
   - Primary fix: Clear cache after batch (addresses H2)
   - Secondary fix: Correct boundary calculation (addresses H3)
   - Rationale: Evidence shows cache growth and boundary issue both contribute

## Files

- `monitor.py` - Main monitoring application
- `pipeline/stages.py` - Processing stages
- `pipeline/queue.py` - Data queue implementation
- `metrics/collector.py` - Metric collection
- `metrics/reporter.py` - Report generation
- `data/generator.py` - Test data generation
