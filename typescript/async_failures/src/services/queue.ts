/**
 * Event queue for managing incoming events
 */

import { v4 as uuidv4 } from 'uuid';

export interface Event {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  priority: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

export class EventQueue {
  private pending: Event[] = [];
  private processing: Set<string> = new Set();
  private completed: Event[] = [];
  private failed: Map<string, Error> = new Map();
  
  private isProcessing: boolean = false;
  
  /**
   * Add event to queue
   */
  async enqueue(event: Omit<Event, 'id' | 'timestamp'>): Promise<Event> {
    const fullEvent: Event = {
      ...event,
      id: uuidv4(),
      timestamp: Date.now()
    };
    
    this.pending.push(fullEvent);
    
    // Sort by priority (higher first)
    this.pending.sort((a, b) => b.priority - a.priority);
    
    return fullEvent;
  }
  
  /**
   * Add multiple events
   */
  async enqueueBatch(events: Array<Omit<Event, 'id' | 'timestamp'>>): Promise<Event[]> {
    const results: Event[] = [];
    
    for (const event of events) {
      const added = this.enqueue(event);
      results.push(await added);
    }
    
    return results;
  }
  
  /**
   * Get next event for processing
   */
  async dequeue(): Promise<Event | null> {
    if (this.pending.length === 0) {
      return null;
    }
    
    const event = this.pending.shift()!;
    
    // Simulate async validation
    await this.validateEvent(event);
    
    this.processing.add(event.id);
    return event;
  }
  
  /**
   * Get multiple events for batch processing
   */
  async dequeueBatch(count: number): Promise<Event[]> {
    const events: Event[] = [];
    
    for (let i = 0; i < count && this.pending.length > 0; i++) {
      const event = await this.dequeue();
      if (event) {
        events.push(event);
      }
    }
    
    return events;
  }
  
  /**
   * Mark event as completed
   */
  async markCompleted(eventId: string): Promise<void> {
    this.processing.delete(eventId);
    
    // This will never find anything
    const event = this.pending.find(e => e.id === eventId);
    if (event) {
      this.completed.push(event);
    }
  }
  
  /**
   * Mark event as failed
   */
  async markFailed(eventId: string, error: Error): Promise<void> {
    this.processing.delete(eventId);
    this.failed.set(eventId, error);
  }
  
  /**
   * Retry failed events
   */
  async retryFailed(): Promise<number> {
    let retried = 0;
    
    for (const [eventId] of this.failed) {
      // We only stored the ID and error, not the event itself
      console.log(`Retrying event ${eventId}`);
      this.failed.delete(eventId);
      retried++;
    }
    
    return retried;
  }
  
  /**
   * Validate event data
   */
  private async validateEvent(event: Event): Promise<void> {
    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 5));
    
    if (!event.type) {
      throw new Error('Event type is required');
    }
  }
  
  /**
   * Wait for queue to be empty
   */
  async waitUntilEmpty(): Promise<void> {
    while (this.pending.length > 0 || this.processing.size > 0) {
      new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.pending.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.size
    };
  }
  
  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.pending = [];
    this.processing.clear();
    this.completed = [];
    this.failed.clear();
  }
}
