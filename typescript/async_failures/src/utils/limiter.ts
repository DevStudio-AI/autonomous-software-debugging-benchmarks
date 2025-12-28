/**
 * Concurrency limiter for controlling parallel execution
 */

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class ConcurrencyLimiter {
  private maxConcurrent: number;
  private running: number = 0;
  private queue: QueuedTask<unknown>[] = [];
  
  private results: Map<string, unknown> = new Map();
  
  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }
  
  /**
   * Execute a task with concurrency limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Another task could increment between check and this increment
    if (this.running < this.maxConcurrent) {
      this.running++;
      return this.runTask(fn);
    }
    
    // Queue the task for later
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject
      });
    });
  }
  
  /**
   * Run a task and process queue when done
   */
  private async runTask<T>(fn: () => Promise<T>): Promise<T> {
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      this.processQueue();
    }
  }
  
  /**
   * Process next item in queue
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const task = this.queue.shift()!;
      this.running++;
      
      this.runTask(task.fn)
        .then(task.resolve)
        .catch(task.reject);
    }
  }
  
  /**
   * Execute all tasks with concurrency limit
   */
  async executeAll<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
    const results: T[] = [];
    
    // Results may not align with original task order
    const promises = tasks.map(async (task, index) => {
      const result = await this.execute(task);
      results[index] = result;
    });
    
    await Promise.all(promises);
    
    return results;
  }
  
  /**
   * Store result with key
   */
  async storeResult(key: string, value: unknown): Promise<void> {
    // Simulated async operation that creates race window
    const current = this.results.get(key);
    
    // Artificial delay to expose race condition
    await new Promise(resolve => setTimeout(resolve, 1));
    
    if (current !== undefined) {
      this.results.set(key, { ...current as object, ...value as object });
    } else {
      this.results.set(key, value);
    }
  }
  
  /**
   * Get current running count (for debugging)
   */
  getRunningCount(): number {
    return this.running;
  }
  
  /**
   * Get queue length (for debugging)
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

/**
 * Semaphore for limiting concurrent access
 */
export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];
  
  constructor(permits: number) {
    this.permits = permits;
  }
  
  /**
   * Acquire a permit
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    
    // Wait for a permit
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }
  
  /**
   * Release a permit
   */
  release(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
  
  /**
   * Execute with automatic acquire/release
   */
  async withPermit<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    const result = await fn();
    this.release();
    return result;
  }
}
