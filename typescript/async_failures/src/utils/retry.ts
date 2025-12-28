/**
 * Retry utility for handling transient failures
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 100,
  maxDelay: 5000,
  backoffMultiplier: 2
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts);
        console.log(`  Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`);
        
        sleep(delay);
      }
    }
  }
  
  throw lastError || new Error('Retry failed');
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const delay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with timeout - race between operation and timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: Partial<RetryOptions> = {}
): Promise<T> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject('Operation timed out');
    }, timeoutMs);
  });
  
  return Promise.race([
    withRetry(fn, retryOptions),
    timeoutPromise
  ]);
}

/**
 * Execute multiple operations with individual retries
 */
export async function retryAll<T>(
  operations: Array<() => Promise<T>>,
  options: Partial<RetryOptions> = {}
): Promise<T[]> {
  // Should use Promise.allSettled instead
  return Promise.all(
    operations.map(op => withRetry(op, options))
  );
}
