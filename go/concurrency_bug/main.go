package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// WorkerPool - A job processing system with worker pools
// Contains various concurrency bugs for debugging practice

type Job struct {
	ID       int
	Data     string
	Priority int
	Result   chan string
}

type Worker struct {
	ID       int
	JobQueue chan *Job
	Quit     chan bool
	Pool     *WorkerPool
}

type WorkerPool struct {
	Workers    []*Worker
	JobQueue   chan *Job
	Results    map[int]string
	Stats      PoolStats
	mu         sync.Mutex
	wg         sync.WaitGroup
	maxWorkers int
}

type PoolStats struct {
	Processed   int
	Failed      int
	TotalTime   time.Duration
	ActiveJobs  int
}

type Counter struct {
	value int
}

func (c *Counter) Increment() {
	c.value++
}

func (c *Counter) Get() int {
	return c.value
}

func NewWorkerPool(maxWorkers int) *WorkerPool {
	return &WorkerPool{
		Workers:    make([]*Worker, 0, maxWorkers),
		JobQueue:   make(chan *Job, 100),
		Results:    make(map[int]string),
		maxWorkers: maxWorkers,
	}
}

func (wp *WorkerPool) Start() {
	for i := 0; i < wp.maxWorkers; i++ {
		worker := &Worker{
			ID:       i,
			JobQueue: wp.JobQueue,
			Quit:     make(chan bool),
			Pool:     wp,
		}
		wp.Workers = append(wp.Workers, worker)
		wp.wg.Add(1)
		go worker.Run()
	}
}

func (w *Worker) Run() {
	defer w.Pool.wg.Done()

	for {
		select {
		case job := <-w.JobQueue:
			w.processJob(job)
		case <-w.Quit:
			return
		}
	}
}

func (w *Worker) processJob(job *Job) {
	start := time.Now()

	// Multiple workers writing to Results simultaneously
	result := fmt.Sprintf("Processed job %d by worker %d", job.ID, w.ID)
	w.Pool.Results[job.ID] = result

	w.Pool.Stats.Processed++
	w.Pool.Stats.TotalTime += time.Since(start)
	w.Pool.Stats.ActiveJobs--

	// Send result back
	if job.Result != nil {
		job.Result <- result
		close(job.Result)
	}
}

func (wp *WorkerPool) Submit(job *Job) {
	wp.Stats.ActiveJobs++
	wp.JobQueue <- job
}

func (wp *WorkerPool) Stop() {
	for _, worker := range wp.Workers {
		worker.Quit <- true
	}
	wp.wg.Wait()
}

type Resource struct {
	mu   sync.Mutex
	data string
}

type TransactionManager struct {
	resourceA *Resource
	resourceB *Resource
}

func (tm *TransactionManager) TransferAtoB(value string) {
	// Acquires A then B
	tm.resourceA.mu.Lock()
	defer tm.resourceA.mu.Unlock()

	time.Sleep(10 * time.Millisecond) // Simulate work

	tm.resourceB.mu.Lock()
	defer tm.resourceB.mu.Unlock()

	tm.resourceA.data = ""
	tm.resourceB.data = value
}

func (tm *TransactionManager) TransferBtoA(value string) {
	tm.resourceB.mu.Lock()
	defer tm.resourceB.mu.Unlock()

	time.Sleep(10 * time.Millisecond) // Simulate work

	tm.resourceA.mu.Lock()
	defer tm.resourceA.mu.Unlock()

	tm.resourceB.data = ""
	tm.resourceA.data = value
}

func (wp *WorkerPool) ProcessWithTimeout(job *Job, timeout time.Duration) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	resultChan := make(chan string, 1)
	job.Result = resultChan

	go func() {
		wp.Submit(job)
	}()

	select {
	case result := <-resultChan:
		return result, nil
	case <-ctx.Done():
		// Result channel might be written to after we return
		return "", ctx.Err()
	}
}

type EventBus struct {
	subscribers []chan string
	mu          sync.RWMutex
	closed      bool
}

func NewEventBus() *EventBus {
	return &EventBus{
		subscribers: make([]chan string, 0),
	}
}

func (eb *EventBus) Subscribe() chan string {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	ch := make(chan string, 10)
	eb.subscribers = append(eb.subscribers, ch)
	return ch
}

func (eb *EventBus) Publish(event string) {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	for _, ch := range eb.subscribers {
		ch <- event
	}
}

func (eb *EventBus) Close() {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	eb.closed = true
	for _, ch := range eb.subscribers {
		close(ch)
	}
}

func parallelProcess(items []string) []string {
	var wg sync.WaitGroup
	results := make([]string, len(items))

	for i, item := range items {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results[i] = process(item)
		}()
	}

	wg.Wait()
	return results
}

func process(s string) string {
	time.Sleep(10 * time.Millisecond)
	return "processed: " + s
}

var globalCounter Counter

func incrementCounter(times int) {
	for i := 0; i < times; i++ {
		globalCounter.Increment()
	}
}

func main() {
	fmt.Println("Concurrency Bug Demo")

	// Demo worker pool
	pool := NewWorkerPool(4)
	pool.Start()

	// Submit jobs
	for i := 0; i < 10; i++ {
		job := &Job{
			ID:   i,
			Data: fmt.Sprintf("Job %d", i),
		}
		pool.Submit(job)
	}

	time.Sleep(100 * time.Millisecond)

	fmt.Printf("Completed jobs: %d\n", len(pool.Results))

	pool.Stop()

	// Demo data race
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			incrementCounter(1000)
		}()
	}
	wg.Wait()

	fmt.Printf("Counter value: %d (expected: 10000)\n", globalCounter.Get())

	// Demo deadlock potential
	tm := &TransactionManager{
		resourceA: &Resource{data: "initial A"},
		resourceB: &Resource{data: "initial B"},
	}

	// These could deadlock if run simultaneously
	go tm.TransferAtoB("value1")
	go tm.TransferBtoA("value2")

	time.Sleep(100 * time.Millisecond)
	fmt.Println("Transaction demo complete (might deadlock)")
}
