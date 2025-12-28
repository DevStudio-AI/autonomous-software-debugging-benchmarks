/**
 * Event Processing Pipeline - Entry Point
 * 
 * This demonstrates a realistic event processing system with
 * various async/await bugs that cause race conditions and failures.
 */

import { EventQueue, Event } from './services/queue.js';
import { ResultStorage } from './services/storage.js';
import { EventProcessor } from './services/processor.js';

// Sample event handlers
const handlers = {
  'user.created': async (event: Event) => {
    // Simulate async processing
    await simulateWork(30, 50);
    return { userId: event.payload.userId, welcomed: true };
  },
  
  'order.placed': async (event: Event) => {
    await simulateWork(40, 80);
    // Randomly fail to simulate real-world conditions
    if (Math.random() < 0.2) {
      throw new Error('Payment processing failed');
    }
    return { orderId: event.payload.orderId, confirmed: true };
  },
  
  'notification.send': async (event: Event) => {
    await simulateWork(20, 40);
    return { notificationId: event.payload.notificationId, sent: true };
  },
  
  'analytics.track': async (event: Event) => {
    await simulateWork(10, 30);
    return { tracked: true, eventType: event.payload.eventType };
  },
  
  'data.sync': async (event: Event) => {
    await simulateWork(50, 100);
    return { synced: true, records: event.payload.recordCount };
  }
};

/**
 * Simulate async work with random duration
 */
function simulateWork(minMs: number, maxMs: number): Promise<void> {
  const duration = minMs + Math.random() * (maxMs - minMs);
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Generate sample events
 */
function generateEvents(count: number): Array<Omit<Event, 'id' | 'timestamp'>> {
  const eventTypes = Object.keys(handlers);
  const events: Array<Omit<Event, 'id' | 'timestamp'>> = [];
  
  for (let i = 0; i < count; i++) {
    const type = eventTypes[i % eventTypes.length];
    events.push({
      type,
      payload: generatePayload(type, i),
      priority: Math.floor(Math.random() * 10)
    });
  }
  
  return events;
}

/**
 * Generate payload based on event type
 */
function generatePayload(type: string, index: number): Record<string, unknown> {
  switch (type) {
    case 'user.created':
      return { userId: `user-${index}`, email: `user${index}@example.com` };
    case 'order.placed':
      return { orderId: `order-${index}`, amount: Math.random() * 1000 };
    case 'notification.send':
      return { notificationId: `notif-${index}`, channel: 'email' };
    case 'analytics.track':
      return { eventType: 'pageview', page: `/page-${index}` };
    case 'data.sync':
      return { recordCount: Math.floor(Math.random() * 100) };
    default:
      return { index };
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('Starting event pipeline...\n');
  
  // Initialize components
  const queue = new EventQueue();
  const storage = new ResultStorage('output.json');
  const processor = new EventProcessor(queue, storage, {
    maxConcurrent: 3,
    timeoutMs: 5000,
    retryAttempts: 3
  });
  
  // Register handlers
  for (const [type, handler] of Object.entries(handlers)) {
    processor.registerHandler(type, handler);
  }
  
  // Generate and enqueue events
  const eventCount = 5;
  const events = generateEvents(eventCount);
  
  console.log(`Processing ${eventCount} events...\n`);
  
  await queue.enqueueBatch(events);
  
  // Process all events
  const results = await processor.processAll();
  
  console.log(`\nProcessed ${results.length} events`);
  
  await processor.waitForCompletion();
  
  // Display final stats
  const stats = processor.getStats();
  const queueStats = queue.getStats();
  
  console.log('\n--- Final Statistics ---');
  console.log(`Processed: ${stats.processed}`);
  console.log(`Still running: ${stats.running}`);
  console.log(`Still queued: ${stats.queued}`);
  console.log(`Queue pending: ${queueStats.pending}`);
  console.log(`Queue failed: ${queueStats.failed}`);
}

// Run the pipeline
main().catch(error => {
  console.error('Pipeline failed:', error);
  process.exit(1);
});
