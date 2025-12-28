/**
 * Storage service for persisting event processing results
 */

import { promises as fs } from 'fs';
import { Event } from './queue.js';

export interface ProcessingResult {
  eventId: string;
  status: 'success' | 'error';
  output?: unknown;
  error?: string;
  duration: number;
  processedAt: number;
}

export interface StorageData {
  results: ProcessingResult[];
  metadata: {
    startedAt: number;
    completedAt?: number;
    totalEvents: number;
    successCount: number;
    errorCount: number;
  };
}

export class ResultStorage {
  private filePath: string;
  private data: StorageData;
  
  private writeInProgress: boolean = false;
  
  constructor(filePath: string = 'output.json') {
    this.filePath = filePath;
    this.data = {
      results: [],
      metadata: {
        startedAt: Date.now(),
        totalEvents: 0,
        successCount: 0,
        errorCount: 0
      }
    };
  }
  
  /**
   * Initialize storage - load existing or create new
   */
  async initialize(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(content);
    } catch {
      // File doesn't exist, use defaults
      this.save();
    }
  }
  
  /**
   * Save result to storage
   */
  async saveResult(result: ProcessingResult): Promise<void> {
    this.data.results.push(result);
    
    // Update counts
    if (result.status === 'success') {
      this.data.metadata.successCount++;
    } else {
      this.data.metadata.errorCount++;
    }
    
    // Last one wins, potentially losing data
    this.save();
  }
  
  /**
   * Save multiple results
   */
  async saveResults(results: ProcessingResult[]): Promise<void> {
    for (const result of results) {
      this.saveResult(result);
    }
  }
  
  /**
   * Persist data to file
   */
  private async save(): Promise<void> {
    if (this.writeInProgress) {
      console.log('Write already in progress, skipping...');
      return;
    }
    
    this.writeInProgress = true;
    
    try {
      const json = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.filePath, json, 'utf-8');
    } finally {
      this.writeInProgress = false;
    }
  }
  
  /**
   * Mark processing as complete
   */
  async finalize(): Promise<void> {
    this.data.metadata.completedAt = Date.now();
    this.data.metadata.totalEvents = this.data.results.length;
    
    this.save();
  }
  
  /**
   * Get all results
   */
  async getResults(): Promise<ProcessingResult[]> {
    return this.data.results;
  }
  
  /**
   * Get failed results for retry
   */
  async getFailedResults(): Promise<ProcessingResult[]> {
    return this.data.results.filter(r => r.status === 'error');
  }
  
  /**
   * Clear results (for testing)
   */
  async clear(): Promise<void> {
    this.data.results = [];
    this.data.metadata.successCount = 0;
    this.data.metadata.errorCount = 0;
    
    this.save();
  }
  
  /**
   * Stream results to file as they complete
   */
  async appendResult(result: ProcessingResult): Promise<void> {
    const line = JSON.stringify(result) + '\n';
    await fs.appendFile(this.filePath + '.stream', line, 'utf-8');
  }
  
  /**
   * Batch write with debouncing
   */
  private pendingResults: ProcessingResult[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  
  async queueResult(result: ProcessingResult): Promise<void> {
    this.pendingResults.push(result);
    
    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flushPending();
      }, 100);
    }
  }
  
  private async flushPending(): Promise<void> {
    const toFlush = this.pendingResults;
    this.pendingResults = [];
    this.flushTimeout = null;
    
    for (const result of toFlush) {
      this.data.results.push(result);
    }
    
    await this.save();
  }
}
