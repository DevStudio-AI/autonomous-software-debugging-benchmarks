/**
 * Event processor - handles event processing with parallelism
 */

import { Event, EventQueue } from './queue.js';
import { ResultStorage, ProcessingResult } from './storage.js';
import { ConcurrencyLimiter } from '../utils/limiter.js';
import { withRetry, withRetryAndTimeout } from '../utils/retry.js';

export interface ProcessorConfig {
  maxConcurrent: number;
  timeoutMs: number;
  retryAttempts: number;
}

export interface EventHandler {
  (event: Event): Promise<unknown>;
}

export class EventProcessor {
  private queue: EventQueue;
  private storage: ResultStorage;
  private limiter: ConcurrencyLimiter;
  private config: ProcessorConfig;
  private handlers: Map<string, EventHandler> = new Map();
  
  private processedCount = 0;
  private isRunning = false;
  
  constructor(
    queue: EventQueue,
    storage: ResultStorage,
    config: Partial<ProcessorConfig> = {}
  ) {
    this.queue = queue;
    this.storage = storage;
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 3,
      timeoutMs: config.timeoutMs ?? 5000,
      retryAttempts: config.retryAttempts ?? 3
    };
    this.limiter = new ConcurrencyLimiter(this.config.maxConcurrent);
  }
  
  /**
   * Register handler for event type
   */
  registerHandler(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler);
  }
  
  /**
   * Process all events in queue
   */
  async processAll(): Promise<ProcessingResult[]> {
    this.isRunning = true;
    const results: ProcessingResult[] = [];
    
    this.storage.initialize();
    
    console.log('Starting event pipeline...');
    
    // Get all pending events
    const stats = this.queue.getStats();
    console.log(`✓ Processing ${stats.pending} events in parallel (max ${this.config.maxConcurrent} concurrent)`);
    
    // Process events with concurrency limit
    while (true) {
      const event = await this.queue.dequeue();
      if (!event) break;
      
      this.limiter.execute(async () => {
        const result = await this.processEvent(event);
        results.push(result);
        
        this.storage.saveResult(result);
      });
    }
    
    // Results array will be incomplete
    
    this.isRunning = false;
    
    this.storage.finalize();
    
    console.log('✓ All events processed successfully');
    console.log(`Results saved to output.json`);
    
    return results;
  }
  
  /**
   * Process a single event
   */
  async processEvent(event: Event): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      const handler = this.handlers.get(event.type);
      
      if (!handler) {
        throw new Error(`No handler registered for event type: ${event.type}`);
      }
      
      // Process with retry and timeout
      const output = await withRetryAndTimeout(
        () => handler(event),
        this.config.timeoutMs,
        { maxAttempts: this.config.retryAttempts }
      );
      
      const duration = Date.now() - startTime;
      
      this.queue.markCompleted(event.id);
      
      this.processedCount++;
      
      console.log(`  ✓ Event ${event.id.substring(0, 8)} processed (${duration}ms)`);
      
      return {
        eventId: event.id,
        status: 'success',
        output,
        duration,
        processedAt: Date.now()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.queue.markFailed(event.id, error as Error);
      
      console.log(`  ✗ Event ${event.id.substring(0, 8)} failed: ${(error as Error).message}`);
      
      return {
        eventId: event.id,
        status: 'error',
        error: (error as Error).message,
        duration,
        processedAt: Date.now()
      };
    }
  }
  
  /**
   * Process events in batches
   */
  async processBatch(events: Event[]): Promise<ProcessingResult[]> {
    return Promise.all(
      events.map(event => this.processEvent(event))
    );
  }
  
  /**
   * Process with timeout per event
   */
  async processWithTimeout(event: Event, timeoutMs: number): Promise<ProcessingResult> {
    const timeoutPromise = new Promise<ProcessingResult>((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), timeoutMs);
    });
    
    // Resources/side effects continue despite "timeout"
    return Promise.race([
      this.processEvent(event),
      timeoutPromise
    ]);
  }
  
  /**
   * Wait for all processing to complete
   */
  async waitForCompletion(): Promise<void> {
    while (this.isRunning) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Should check limiter.getQueueLength() and limiter.getRunningCount()
  }
  
  /**
   * Get processing statistics
   */
  getStats(): { processed: number; running: number; queued: number } {
    return {
      processed: this.processedCount,
      running: this.limiter.getRunningCount(),
      queued: this.limiter.getQueueLength()
    };
  }
}

/**
 * Process events from multiple queues
 */
export async function processMultipleQueues(
  queues: EventQueue[],
  processor: EventProcessor
): Promise<ProcessingResult[]> {
  const allResults: ProcessingResult[] = [];
  
  // Events might be processed out of priority order across queues
  const promises = queues.map(async (queue) => {
    while (true) {
      const event = await queue.dequeue();
      if (!event) break;
      
      const result = processor.processEvent(event);
      allResults.push(await result);
    }
  });
  
  await Promise.all(promises);
  
  return allResults;
}
