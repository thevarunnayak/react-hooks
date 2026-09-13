import { MachineCodingChallenge } from '../../types/machineCodingChallenge';

export const LRU_CACHE_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-lru-cache',
  title: 'LRU (Least Recently Used) Cache',
  slug: 'backend-lru-cache',
  difficulty: 'Medium',
  track: 'backend',
  estimatedTime: '30 mins',
  category: 'Backend & APIs',
  tags: ['Data Structures', 'Caching', 'Algorithms', 'Hash Map', 'Doubly Linked List'],
  description:
    'Design and implement an in-memory Least Recently Used (LRU) Cache. The cache should support O(1) average time complexity for both get and put operations. When the cache reaches its maximum capacity, it must invalidate and evict the least recently used item before inserting a new item.',
  requirements: [
    'Initialize with a positive maximum capacity `capacity`.',
    '`get(key)`: Return the value of the key if it exists, otherwise return `undefined`. Querying an existing key marks it as most recently used.',
    '`put(key, value)`: Update the value if key exists, or insert key-value pair. If capacity is exceeded, evict the least recently used key.',
    '`size()`: Return the current number of cached items.',
    '`clear()`: Flush all cached entries.',
  ],
  functionalRequirements: [
    'O(1) average time complexity for get and put operations.',
    'Accessing an existing key via get(key) updates its recency rank to most recent.',
    'Updating an existing key via put(key, newVal) updates its value AND marks it as most recent.',
    'Eviction must discard the true least recently accessed key.',
  ],
  UIRequirements: [
    'This is an in-memory algorithmic challenge. No React UI rendering is required.',
    'Export the LRUCache class using export class LRUCache or export default class LRUCache.',
  ],
  edgeCases: [
    'Capacity of 1: Evicts the single element on every new insert.',
    'Updating an already present key should not trigger an eviction even if cache is full.',
    'Querying non-existent key should not alter existing LRU order.',
    'Handling diverse key types (strings, numbers).',
  ],
  hints: [
    'In JavaScript, the ES6 Map preserves insertion order. Deleting a key and re-inserting it moves it to the very end of the map (most recent).',
    'Alternatively, combine a Hash Map with a Doubly Linked List for language-agnostic O(1) operations.',
  ],
  constraints: [
    '1 <= capacity <= 10,000',
    'Operations will be called up to 10,000 times',
  ],
  interviewNotes:
    'Interviewers look for understanding of cache eviction policies and time complexity tradeoffs. While Map gives O(1) in JS, explaining how a Doubly Linked List + Hash Map works under the hood demonstrates deep systems knowledge.',
  evaluationRules: [
    'Accurate eviction order',
    'Proper update of recency on get',
    'Proper update of recency on put',
    'Handling edge case capacity=1',
  ],
  starterCode: `// LRU Cache Implementation
// Export the LRUCache class as default or named export

export class LRUCache<K = any, V = any> {
  private capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    // TODO: Return value and mark as recently used
    return undefined;
  }

  put(key: K, value: V): void {
    // TODO: Insert or update, evict least recently used if needed
  }

  size(): number {
    // TODO: Return current size
    return 0;
  }

  clear(): void {
    // TODO: Clear all items
  }
}

export default LRUCache;
`,
  solutionCode: `export class LRUCache<K = any, V = any> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }
    this.capacity = capacity;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}

export default LRUCache;
`,
  testCases: [
    {
      id: 'lru-1',
      name: 'Basic Put and Get',
      description: 'Store items and retrieve their values accurately.',
      testFn: async (helpers) => {
        const LRU = helpers.exports?.LRUCache || helpers.exports?.default;
        helpers.expect(LRU).toBeTruthy();
        const cache = new LRU(2);
        cache.put('a', 1);
        cache.put('b', 2);
        helpers.expect(cache.get('a')).toBe(1);
        helpers.expect(cache.get('b')).toBe(2);
        helpers.expect(cache.size()).toBe(2);
      },
    },
    {
      id: 'lru-2',
      name: 'Eviction on Capacity Overflow',
      description: 'Verify least recently used key is evicted when capacity is reached.',
      testFn: async (helpers) => {
        const LRU = helpers.exports?.LRUCache || helpers.exports?.default;
        const cache = new LRU(2);
        cache.put('a', 1);
        cache.put('b', 2);
        cache.put('c', 3);
        helpers.expect(cache.get('a')).toBe(undefined);
        helpers.expect(cache.get('b')).toBe(2);
        helpers.expect(cache.get('c')).toBe(3);
      },
    },
    {
      id: 'lru-3',
      name: 'Get Updates Recency Order',
      description: 'Querying an item prevents it from being evicted on next insert.',
      testFn: async (helpers) => {
        const LRU = helpers.exports?.LRUCache || helpers.exports?.default;
        const cache = new LRU(2);
        cache.put('a', 1);
        cache.put('b', 2);
        cache.get('a');
        cache.put('c', 3);
        helpers.expect(cache.get('b')).toBe(undefined);
        helpers.expect(cache.get('a')).toBe(1);
        helpers.expect(cache.get('c')).toBe(3);
      },
    },
    {
      id: 'lru-4',
      name: 'Hidden: Capacity 1 and Key Overwriting',
      description: 'Test corner cases with capacity=1 and updating existing key values.',
      hidden: true,
      testFn: async (helpers) => {
        const LRU = helpers.exports?.LRUCache || helpers.exports?.default;
        const cache = new LRU(1);
        cache.put('x', 10);
        helpers.expect(cache.get('x')).toBe(10);
        cache.put('y', 20);
        helpers.expect(cache.get('x')).toBe(undefined);
        helpers.expect(cache.get('y')).toBe(20);

        const cache2 = new LRU(2);
        cache2.put('k', 100);
        cache2.put('k', 200);
        helpers.expect(cache2.size()).toBe(1);
        helpers.expect(cache2.get('k')).toBe(200);
      },
    },
  ],
};

export const TOKEN_BUCKET_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-rate-limiter',
  title: 'Token Bucket Rate Limiter',
  slug: 'backend-rate-limiter',
  difficulty: 'Medium',
  track: 'backend',
  estimatedTime: '30 mins',
  category: 'Backend & APIs',
  tags: ['Rate Limiting', 'Algorithms', 'System Design', 'Concurrency'],
  description:
    'Implement a Token Bucket Rate Limiter used widely in API gateways and distributed services. The bucket starts full with a given capacity and continuously refills with tokens at a rate of refillRatePerSecond. Each request consumes 1 or more tokens. If enough tokens exist, the request is allowed; otherwise it is rejected.',
  requirements: [
    'Constructor accepts `capacity` (max tokens) and `refillRatePerSecond` (tokens added per sec).',
    '`tryConsume(tokens = 1)`: Returns true and deducts tokens if available; returns false without deducting if insufficient.',
    '`getAvailableTokens()`: Returns the current tokens count (capped at capacity).',
    '`reset()`: Restores bucket to full capacity.',
  ],
  functionalRequirements: [
    'Lazy refill on demand: Calculate tokens accumulated since last check using elapsed time.',
    'Tokens must never exceed capacity.',
    'Accurately refill tokens proportionally to milliseconds elapsed.',
    'Disallow negative or invalid consumption requests.',
  ],
  UIRequirements: [
    'Algorithmic/Backend evaluation. No DOM elements required.',
    'Export class as TokenBucketRateLimiter or default export.',
  ],
  edgeCases: [
    'Rapid consecutive calls at the exact same millisecond: must not grant extra tokens.',
    'Long period of idle time: tokens must cap strictly at capacity rather than growing infinitely.',
    'Requesting more tokens than total capacity must always return false.',
  ],
  hints: [
    'Do not use setInterval to refill tokens every second. Instead, use Date.now() or performance.now() to calculate tokens added whenever tryConsume or getAvailableTokens is invoked.',
  ],
  constraints: [
    'capacity >= 1',
    'refillRatePerSecond > 0',
  ],
  interviewNotes:
    'Interviewers look for lazy evaluation (time delta calculation) vs active timers, proper floating-point handling, and token capping.',
  evaluationRules: [
    'Immediate consumption up to capacity',
    'Rejection after bucket exhaustion',
    'Proper refill based on elapsed time',
    'Token count capped at capacity',
  ],
  starterCode: `// Token Bucket Rate Limiter
// Export TokenBucketRateLimiter as named or default export

export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSecond: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  tryConsume(tokens: number = 1): boolean {
    // TODO: Implement lazy refill and consume
    return false;
  }

  getAvailableTokens(): number {
    // TODO: Return current tokens after refill calculation
    return 0;
  }

  reset(): void {
    // TODO: Reset bucket to full
  }
}

export default TokenBucketRateLimiter;
`,
  solutionCode: `export class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSecond: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRatePerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = now;
  }

  tryConsume(tokens: number = 1): boolean {
    if (tokens <= 0) return false;
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  reset(): void {
    this.tokens = this.capacity;
    this.lastRefillTimestamp = Date.now();
  }
}

export default TokenBucketRateLimiter;
`,
  testCases: [
    {
      id: 'rate-1',
      name: 'Consume within Initial Capacity',
      description: 'Should allow requests when bucket has available capacity.',
      testFn: async (helpers) => {
        const Limiter = helpers.exports?.TokenBucketRateLimiter || helpers.exports?.default;
        helpers.expect(Limiter).toBeTruthy();
        const limiter = new Limiter(3, 1);
        helpers.expect(limiter.tryConsume(1)).toBe(true);
        helpers.expect(limiter.tryConsume(2)).toBe(true);
        helpers.expect(limiter.tryConsume(1)).toBe(false);
      },
    },
    {
      id: 'rate-2',
      name: 'Refill Over Time',
      description: 'Tokens refill according to the configured rate after delay.',
      testFn: async (helpers) => {
        const Limiter = helpers.exports?.TokenBucketRateLimiter || helpers.exports?.default;
        const limiter = new Limiter(2, 5);
        helpers.expect(limiter.tryConsume(2)).toBe(true);
        helpers.expect(limiter.tryConsume(1)).toBe(false);

        await helpers.sleep(250);
        helpers.expect(limiter.tryConsume(1)).toBe(true);
      },
    },
    {
      id: 'rate-3',
      name: 'Tokens Capped at Capacity',
      description: 'Even after extended waiting, tokens cannot exceed initial capacity.',
      testFn: async (helpers) => {
        const Limiter = helpers.exports?.TokenBucketRateLimiter || helpers.exports?.default;
        const limiter = new Limiter(2, 50);
        await helpers.sleep(100);
        helpers.expect(limiter.getAvailableTokens()).toBeLessThan(2.01);
      },
    },
    {
      id: 'rate-4',
      name: 'Hidden: Reset and Partial Token Consumption',
      description: 'Verify reset() method and rejection when requesting more than capacity.',
      hidden: true,
      testFn: async (helpers) => {
        const Limiter = helpers.exports?.TokenBucketRateLimiter || helpers.exports?.default;
        const limiter = new Limiter(5, 1);
        helpers.expect(limiter.tryConsume(5)).toBe(true);
        helpers.expect(limiter.tryConsume(1)).toBe(false);
        limiter.reset();
        helpers.expect(limiter.tryConsume(1)).toBe(true);
        helpers.expect(limiter.tryConsume(10)).toBe(false);
      },
    },
  ],
};

export const CONCURRENT_SCHEDULER_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-concurrent-scheduler',
  title: 'Concurrent Task Queue with Concurrency Limit',
  slug: 'backend-concurrent-scheduler',
  difficulty: 'Hard',
  track: 'backend',
  estimatedTime: '35 mins',
  category: 'Backend & APIs',
  tags: ['Async', 'Concurrency', 'Promises', 'Queue', 'Job Scheduler'],
  description:
    'Build an asynchronous Task Queue (Job Scheduler) that executes async tasks with a strict concurrency limit maxConcurrency. If more tasks are queued than the concurrency limit allows, excess tasks wait in FIFO order and run as soon as active slots free up.',
  requirements: [
    'Constructor accepts `maxConcurrency` (integer >= 1).',
    '`add<T>(task: () => Promise<T>): Promise<T>`: Schedules a task and returns a promise that resolves or rejects with the task result.',
    '`getRunningCount()`: Returns number of currently executing tasks.',
    '`getPendingCount()`: Returns number of queued tasks awaiting execution.',
  ],
  functionalRequirements: [
    'At most maxConcurrency tasks are running in parallel at any given instant.',
    'Tasks must execute in FIFO order as slots become available.',
    'If a task rejects with an error, the returned promise rejects accordingly, but remaining tasks continue processing normally.',
  ],
  UIRequirements: [
    'Backend async logic. No DOM elements required.',
    'Export class as TaskQueue or default export.',
  ],
  edgeCases: [
    'Task that throws synchronous exception or rejects must not jam the queue.',
    'Concurrency limit of 1: behaves as a serial queue.',
    'Queueing hundreds of tasks simultaneously.',
  ],
  hints: [
    'Store tasks as objects containing task, resolve, reject in a pending queue array.',
    'In a helper runNext(), check running < maxConcurrency && queue.length > 0. Increment running, invoke task, and in finally decrement running and trigger runNext().',
  ],
  constraints: ['maxConcurrency >= 1'],
  interviewNotes:
    'A classic frontend/backend systems interview question (often asked at Uber, Stripe, Netflix) testing deep understanding of Promise lifecycles, event loop microtasks, and error boundaries.',
  evaluationRules: [
    'Strict concurrency ceiling',
    'Preserved resolution and rejection values',
    'Non-blocking error handling',
    'Accurate queue counts',
  ],
  starterCode: `// Concurrent Task Queue
// Export TaskQueue as named or default export

export class TaskQueue {
  private maxConcurrency: number;

  constructor(maxConcurrency: number) {
    this.maxConcurrency = maxConcurrency;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    // TODO: Enqueue task with concurrency limit
    return Promise.reject(new Error('Not implemented'));
  }

  getRunningCount(): number {
    return 0;
  }

  getPendingCount(): number {
    return 0;
  }
}

export default TaskQueue;
`,
  solutionCode: `export class TaskQueue {
  private maxConcurrency: number;
  private running: number = 0;
  private queue: Array<{
    task: () => Promise<any>;
    resolve: (val: any) => void;
    reject: (err: any) => void;
  }> = [];

  constructor(maxConcurrency: number) {
    if (maxConcurrency < 1) throw new Error('Concurrency must be >= 1');
    this.maxConcurrency = maxConcurrency;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  private processNext(): void {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift()!;
    this.running++;

    Promise.resolve()
      .then(() => item.task())
      .then(
        (val) => item.resolve(val),
        (err) => item.reject(err)
      )
      .finally(() => {
        this.running--;
        this.processNext();
      });
  }

  getRunningCount(): number {
    return this.running;
  }

  getPendingCount(): number {
    return this.queue.length;
  }
}

export default TaskQueue;
`,
  testCases: [
    {
      id: 'queue-1',
      name: 'Executes Tasks and Returns Results',
      description: 'Tasks resolve with their expected values.',
      testFn: async (helpers) => {
        const TaskQueue = helpers.exports?.TaskQueue || helpers.exports?.default;
        helpers.expect(TaskQueue).toBeTruthy();
        const q = new TaskQueue(2);
        const res1 = await q.add(async () => 42);
        const res2 = await q.add(async () => 'hello');
        helpers.expect(res1).toBe(42);
        helpers.expect(res2).toBe('hello');
      },
    },
    {
      id: 'queue-2',
      name: 'Respects Max Concurrency Limit',
      description: 'Never executes more than maxConcurrency tasks simultaneously.',
      testFn: async (helpers) => {
        const TaskQueue = helpers.exports?.TaskQueue || helpers.exports?.default;
        const q = new TaskQueue(2);
        let maxRunningObserved = 0;

        const createTask = (delayMs: number, id: number) => async () => {
          const currentRunning = q.getRunningCount();
          if (currentRunning > maxRunningObserved) {
            maxRunningObserved = currentRunning;
          }
          await helpers.sleep(delayMs);
          return id;
        };

        const p1 = q.add(createTask(50, 1));
        const p2 = q.add(createTask(50, 2));
        const p3 = q.add(createTask(50, 3));
        const p4 = q.add(createTask(50, 4));

        helpers.expect(q.getRunningCount()).toBe(2);
        helpers.expect(q.getPendingCount()).toBe(2);

        const results = await Promise.all([p1, p2, p3, p4]);
        helpers.expect(results).toEqual([1, 2, 3, 4]);
        helpers.expect(maxRunningObserved).toBeLessThan(3);
        helpers.expect(q.getRunningCount()).toBe(0);
      },
    },
    {
      id: 'queue-3',
      name: 'Handles Rejected Task Without Freezing Queue',
      description: 'A failing task rejects its promise but subsequent tasks continue.',
      testFn: async (helpers) => {
        const TaskQueue = helpers.exports?.TaskQueue || helpers.exports?.default;
        const q = new TaskQueue(1);

        let caught = false;
        try {
          await q.add(async () => {
            throw new Error('Task Failed');
          });
        } catch (e: any) {
          caught = true;
          helpers.expect(e.message).toBe('Task Failed');
        }
        helpers.expect(caught).toBe(true);

        const nextResult = await q.add(async () => 'recovered');
        helpers.expect(nextResult).toBe('recovered');
      },
    },
    {
      id: 'queue-4',
      name: 'Hidden: High Concurrency Queueing',
      description: 'Stress test FIFO order with multiple delayed tasks.',
      hidden: true,
      testFn: async (helpers) => {
        const TaskQueue = helpers.exports?.TaskQueue || helpers.exports?.default;
        const q = new TaskQueue(3);
        const order: number[] = [];

        const tasks = Array.from({ length: 9 }, (_, i) =>
          q.add(async () => {
            await helpers.sleep(20);
            order.push(i);
            return i;
          })
        );

        const res = await Promise.all(tasks);
        helpers.expect(res).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        helpers.expect(order).toHaveLength(9);
      },
    },
  ],
};

export const EVENT_EMITTER_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-event-emitter',
  title: 'Custom Event Emitter (Pub/Sub)',
  slug: 'backend-event-emitter',
  difficulty: 'Easy',
  track: 'backend',
  estimatedTime: '25 mins',
  category: 'Backend & APIs',
  tags: ['Event-Driven', 'Design Patterns', 'PubSub', 'TypeScript'],
  description:
    'Implement a custom EventEmitter class similar to Node.js events module. It should support subscribing to events, emitting events with arguments, unsubscribing, one-time listeners (once), and counting active listeners.',
  requirements: [
    '`on(event, listener)`: Adds a listener function to the end of the listeners array for the specified event.',
    '`off(event, listener)`: Removes the specified listener from the event.',
    '`emit(event, ...args)`: Synchronously calls each of the listeners registered for the event, passing the supplied arguments. Returns true if event had listeners, false otherwise.',
    '`once(event, listener)`: Adds a one-time listener that automatically removes itself after its first execution.',
    '`listenerCount(event)`: Returns number of listeners registered for the event.',
    '`removeAllListeners(event?)`: Removes all listeners, or those for the specified event.',
  ],
  functionalRequirements: [
    'Listeners must execute in the exact order they were registered.',
    'Calling off inside a listener during an emit must not skip remaining sibling listeners.',
    'Allow registering the same function multiple times.',
  ],
  UIRequirements: [
    'In-memory logic. No React component required.',
    'Export class as EventEmitter or default export.',
  ],
  edgeCases: [
    'Emitting an event with zero listeners returns false.',
    'Removing a non-existent listener does nothing without throwing.',
    'One-time listener unregisters itself even if called with multiple arguments.',
  ],
  hints: [
    'Store listeners in a Map<string, Function[]> or object.',
    'For once, wrap the original listener in a wrapper that invokes off and then calls the original listener.',
  ],
  constraints: ['Event names are non-empty strings'],
  interviewNotes:
    'A staple frontend & backend interview question testing closures, array mutation safety during iteration, and pub/sub architecture.',
  evaluationRules: [
    'Proper parameter passing to listeners',
    'Safe unsubscription without array corruption',
    'Accurate execution count for once',
    'Correct listener counts',
  ],
  starterCode: `// Custom Event Emitter
// Export EventEmitter as named or default export

export class EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this {
    // TODO: Register listener
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    // TODO: Remove listener
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    // TODO: Dispatch event to registered listeners
    return false;
  }

  once(event: string, listener: (...args: any[]) => void): this {
    // TODO: Register one-time listener
    return this;
  }

  listenerCount(event: string): number {
    return 0;
  }

  removeAllListeners(event?: string): this {
    return this;
  }
}

export default EventEmitter;
`,
  solutionCode: `export class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  off(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.events.get(event);
    if (!listeners) return this;
    const idx = listeners.indexOf(listener);
    if (idx !== -1) {
      listeners.splice(idx, 1);
      if (listeners.length === 0) {
        this.events.delete(event);
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }
    const copy = [...listeners];
    for (const fn of copy) {
      fn(...args);
    }
    return true;
  }

  once(event: string, listener: (...args: any[]) => void): this {
    const wrapper = (...args: any[]) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length ?? 0;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }
}

export default EventEmitter;
`,
  testCases: [
    {
      id: 'emitter-1',
      name: 'Subscribe and Emit Events',
      description: 'Listeners receive emitted arguments in registration order.',
      testFn: async (helpers) => {
        const EE = helpers.exports?.EventEmitter || helpers.exports?.default;
        helpers.expect(EE).toBeTruthy();
        const emitter = new EE();
        const received: string[] = [];

        emitter.on('data', (val: string) => received.push('L1:' + val));
        emitter.on('data', (val: string) => received.push('L2:' + val));

        const emitted = emitter.emit('data', 'test');
        helpers.expect(emitted).toBe(true);
        helpers.expect(received).toEqual(['L1:test', 'L2:test']);
      },
    },
    {
      id: 'emitter-2',
      name: 'Unsubscribe with off()',
      description: 'Removing a listener prevents future invocations.',
      testFn: async (helpers) => {
        const EE = helpers.exports?.EventEmitter || helpers.exports?.default;
        const emitter = new EE();
        let count = 0;
        const fn = () => count++;

        emitter.on('ping', fn);
        emitter.emit('ping');
        helpers.expect(count).toBe(1);

        emitter.off('ping', fn);
        emitter.emit('ping');
        helpers.expect(count).toBe(1);
        helpers.expect(emitter.listenerCount('ping')).toBe(0);
      },
    },
    {
      id: 'emitter-3',
      name: 'Once Listener Triggered Exactly Once',
      description: 'A listener registered via once() self-unregisters after first call.',
      testFn: async (helpers) => {
        const EE = helpers.exports?.EventEmitter || helpers.exports?.default;
        const emitter = new EE();
        let callCount = 0;

        emitter.once('login', () => callCount++);
        helpers.expect(emitter.listenerCount('login')).toBe(1);

        emitter.emit('login');
        helpers.expect(callCount).toBe(1);
        helpers.expect(emitter.listenerCount('login')).toBe(0);

        emitter.emit('login');
        helpers.expect(callCount).toBe(1);
      },
    },
    {
      id: 'emitter-4',
      name: 'Hidden: Emit Return Value and RemoveAllListeners',
      description: 'Verify emit returns false for unknown events and removeAllListeners clears state.',
      hidden: true,
      testFn: async (helpers) => {
        const EE = helpers.exports?.EventEmitter || helpers.exports?.default;
        const emitter = new EE();
        helpers.expect(emitter.emit('unknown')).toBe(false);

        emitter.on('e1', () => {});
        emitter.on('e2', () => {});
        helpers.expect(emitter.listenerCount('e1')).toBe(1);
        helpers.expect(emitter.listenerCount('e2')).toBe(1);

        emitter.removeAllListeners('e1');
        helpers.expect(emitter.listenerCount('e1')).toBe(0);
        helpers.expect(emitter.listenerCount('e2')).toBe(1);

        emitter.removeAllListeners();
        helpers.expect(emitter.listenerCount('e2')).toBe(0);
      },
    },
  ],
};

export const RETRY_BACKOFF_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-retry-backoff',
  title: 'Async Retry with Exponential Backoff',
  slug: 'backend-retry-backoff',
  difficulty: 'Medium',
  track: 'backend',
  estimatedTime: '25 mins',
  category: 'Backend & APIs',
  tags: ['Async', 'Resilience', 'Networking', 'Error Handling', 'Algorithms'],
  description:
    'Write a resilient utility function retryWithBackoff(fn, options) that executes an asynchronous function fn and retries it upon failure using exponential backoff with an optional maximum delay and retry predicate.',
  requirements: [
    'Function signature: `retryWithBackoff<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>`',
    'Options support: `maxRetries` (default: 3), `baseDelayMs` (default: 100), `backoffFactor` (default: 2), `maxDelayMs` (default: 5000), `shouldRetry` predicate.',
    'Delay increases exponentially between retry attempts.',
    'If fn succeeds, resolve immediately with result.',
    'If all retries are exhausted or shouldRetry returns false, reject with the final error.',
  ],
  functionalRequirements: [
    'Delay increases exponentially between attempts.',
    'Never exceed maxDelayMs.',
    'Respect the shouldRetry predicate when supplied.',
  ],
  UIRequirements: [
    'In-memory async utility. No UI component required.',
    'Export retryWithBackoff as named or default export.',
  ],
  edgeCases: [
    'Immediate success on attempt 1: zero delays incurred.',
    'maxRetries = 0: calls fn once, throws immediately on failure.',
    'Predicate shouldRetry returning false halts further retries.',
  ],
  hints: [
    'Use a loop for (let attempt = 0; attempt <= maxRetries; attempt++).',
    'Calculate delay using Math.min(baseDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs).',
  ],
  constraints: ['maxRetries >= 0', 'baseDelayMs >= 0'],
  interviewNotes:
    'Critical for cloud APIs and microservice clients to avoid thundering herd and recover from transient network drops.',
  evaluationRules: [
    'Immediate return on first-attempt success',
    'Accurate backoff delay increments',
    'Rejection after exhausted retries',
    'Predicate-driven early termination',
  ],
  starterCode: `// Async Retry with Exponential Backoff
// Export retryWithBackoff as named or default export

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // TODO: Implement exponential backoff retry loop
  return fn();
}

export default retryWithBackoff;
`,
  solutionCode: `export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  backoffFactor?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 100,
    backoffFactor = 2,
    maxDelayMs = 5000,
    shouldRetry = () => true,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      if (attempt === maxRetries || !shouldRetry(err, attempt + 1)) {
        throw lastError;
      }

      const delay = Math.min(baseDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export default retryWithBackoff;
`,
  testCases: [
    {
      id: 'retry-1',
      name: 'Resolves on First Attempt',
      description: 'Returns result immediately without delay if function succeeds initially.',
      testFn: async (helpers) => {
        const retry = helpers.exports?.retryWithBackoff || helpers.exports?.default;
        helpers.expect(retry).toBeTruthy();
        let calls = 0;
        const res = await retry(async () => {
          calls++;
          return 'ok';
        });
        helpers.expect(res).toBe('ok');
        helpers.expect(calls).toBe(1);
      },
    },
    {
      id: 'retry-2',
      name: 'Retries and Eventually Succeeds',
      description: 'Retries on error and returns value once fn succeeds.',
      testFn: async (helpers) => {
        const retry = helpers.exports?.retryWithBackoff || helpers.exports?.default;
        let attempts = 0;
        const res = await retry(
          async () => {
            attempts++;
            if (attempts < 3) throw new Error('Transient error');
            return 'recovered';
          },
          { maxRetries: 3, baseDelayMs: 20, backoffFactor: 2 }
        );
        helpers.expect(res).toBe('recovered');
        helpers.expect(attempts).toBe(3);
      },
    },
    {
      id: 'retry-3',
      name: 'Throws Error When Retries Exhausted',
      description: 'Rejects with final error when maximum retries are reached.',
      testFn: async (helpers) => {
        const retry = helpers.exports?.retryWithBackoff || helpers.exports?.default;
        let attempts = 0;
        let caught = false;

        try {
          await retry(
            async () => {
              attempts++;
              throw new Error('Permanent failure');
            },
            { maxRetries: 2, baseDelayMs: 15, backoffFactor: 2 }
          );
        } catch (e: any) {
          caught = true;
          helpers.expect(e.message).toBe('Permanent failure');
        }

        helpers.expect(caught).toBe(true);
        helpers.expect(attempts).toBe(3);
      },
    },
    {
      id: 'retry-4',
      name: 'Hidden: shouldRetry Predicate Prevents Unnecessary Retries',
      description: 'Halts immediately on non-retryable errors like 404.',
      hidden: true,
      testFn: async (helpers) => {
        const retry = helpers.exports?.retryWithBackoff || helpers.exports?.default;
        let attempts = 0;

        let caught = false;
        try {
          await retry(
            async () => {
              attempts++;
              const err: any = new Error('Not Found');
              err.status = 404;
              throw err;
            },
            {
              maxRetries: 5,
              baseDelayMs: 10,
              shouldRetry: (err: any) => err.status !== 404,
            }
          );
        } catch (e: any) {
          caught = true;
          helpers.expect(e.status).toBe(404);
        }

        helpers.expect(caught).toBe(true);
        helpers.expect(attempts).toBe(1);
      },
    },
  ],
};

export const DEEP_QUERY_FLATTEN_CHALLENGE: MachineCodingChallenge = {
  id: 'backend-deep-query-flatten',
  title: 'Deep Object Flattener & Path Query',
  slug: 'backend-deep-query-flatten',
  difficulty: 'Easy',
  track: 'backend',
  estimatedTime: '20 mins',
  category: 'Data & State Management',
  tags: ['Objects', 'Recursion', 'Utility', 'Data Transformation'],
  description:
    'Create two complementary data manipulation functions: flattenObject(obj, delimiter) which turns nested objects into single-level key-path objects, and getByPath(obj, path, defaultValue) which safely extracts nested values using dot/bracket notation.',
  requirements: [
    '`flattenObject(obj, delimiter = ".")`: Recursively flattens nested object keys into path strings e.g. `{ a: { b: 1 } }` -> `{ "a.b": 1 }`.',
    '`getByPath(obj, path, defaultValue = undefined)`: Retrieves the value at path (e.g. `"user.profile.name"` or `["user", "profile", "name"]`). If path is undefined or null, returns defaultValue.',
  ],
  functionalRequirements: [
    'Handles nested objects, arrays, and primitive values (numbers, strings, booleans, null).',
    'Safely returns defaultValue when encountering null or undefined along the traversal path without throwing TypeError.',
  ],
  UIRequirements: [
    'Pure JavaScript/TypeScript data utilities. No DOM elements required.',
    'Export flattenObject and getByPath as named exports.',
  ],
  edgeCases: [
    'Empty object: returns {}',
    'Path accessing property on null or undefined: returns defaultValue cleanly.',
    'Keys with dots inside their name when custom delimiter is specified.',
  ],
  hints: [
    'For flattenObject, use recursion with an accumulator prefix.',
    'For getByPath, split string paths by dot and use reduce.',
  ],
  constraints: ['Objects are JSON-serializable without circular references'],
  interviewNotes:
    'Frequently asked in frontend and node backend interviews (implementing Lodash get and flatten). Tests clean recursion, edge-case null safety, and parameter defaults.',
  evaluationRules: [
    'Correct flattened key paths',
    'Proper handling of primitive leaves',
    'Null-safe traversal in getByPath',
    'Default value fallback',
  ],
  starterCode: `// Deep Object Flattener & Path Query
// Export flattenObject and getByPath as named exports

export function flattenObject(
  obj: Record<string, any>,
  delimiter: string = '.'
): Record<string, any> {
  // TODO: Flatten nested keys into dot-separated paths
  return {};
}

export function getByPath(
  obj: any,
  path: string | string[],
  defaultValue?: any
): any {
  // TODO: Safely retrieve nested value by path
  return defaultValue;
}

export default { flattenObject, getByPath };
`,
  solutionCode: `export function flattenObject(
  obj: Record<string, any>,
  delimiter: string = '.'
): Record<string, any> {
  const result: Record<string, any> = {};

  function recurse(current: any, prefix: string) {
    if (
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      Object.keys(current).length > 0
    ) {
      for (const [key, val] of Object.entries(current)) {
        const nextPrefix = prefix ? prefix + delimiter + key : key;
        recurse(val, nextPrefix);
      }
    } else {
      if (prefix) {
        result[prefix] = current;
      }
    }
  }

  recurse(obj, '');
  return result;
}

export function getByPath(
  obj: any,
  path: string | string[],
  defaultValue?: any
): any {
  if (obj == null) return defaultValue;

  const segments = Array.isArray(path)
    ? path
    : typeof path === 'string'
    ? path.replace(/\\[(\\w+)\\]/g, '.$1').split('.').filter(Boolean)
    : [];

  let current = obj;
  for (const seg of segments) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[seg];
  }

  return current === undefined ? defaultValue : current;
}

export default { flattenObject, getByPath };
`,
  testCases: [
    {
      id: 'deep-1',
      name: 'Flatten Simple Nested Object',
      description: 'Converts multi-level nested keys into delimiter-separated keys.',
      testFn: async (helpers) => {
        const flatten = helpers.exports?.flattenObject;
        helpers.expect(flatten).toBeTruthy();

        const input = {
          user: {
            name: 'Alice',
            address: {
              city: 'Seattle',
            },
          },
        };

        const out = flatten(input);
        helpers.expect(out).toEqual({
          'user.name': 'Alice',
          'user.address.city': 'Seattle',
        });
      },
    },
    {
      id: 'deep-2',
      name: 'getByPath Returns Nested Values',
      description: 'Navigates dot paths to extract deeply nested values.',
      testFn: async (helpers) => {
        const get = helpers.exports?.getByPath;
        helpers.expect(get).toBeTruthy();

        const data = { a: { b: { c: 100 } } };
        helpers.expect(get(data, 'a.b.c')).toBe(100);
        helpers.expect(get(data, 'a.b')).toEqual({ c: 100 });
      },
    },
    {
      id: 'deep-3',
      name: 'getByPath Returns Default Value on Missing Path',
      description: 'Safely returns fallback without TypeError when path does not exist.',
      testFn: async (helpers) => {
        const get = helpers.exports?.getByPath;
        const data = { x: null };
        helpers.expect(get(data, 'x.y.z', 'fallback')).toBe('fallback');
        helpers.expect(get(null, 'a.b', 404)).toBe(404);
      },
    },
    {
      id: 'deep-4',
      name: 'Hidden: Custom Delimiter and Empty Objects',
      description: 'Verify custom delimiter support and empty object handling.',
      hidden: true,
      testFn: async (helpers) => {
        const flatten = helpers.exports?.flattenObject;
        helpers.expect(flatten({})).toEqual({});

        const res = flatten({ a: { b: 1 } }, '/');
        helpers.expect(res).toEqual({ 'a/b': 1 });
      },
    },
  ],
};

export const ALL_BACKEND_CHALLENGES: MachineCodingChallenge[] = [
  LRU_CACHE_CHALLENGE,
  TOKEN_BUCKET_CHALLENGE,
  CONCURRENT_SCHEDULER_CHALLENGE,
  EVENT_EMITTER_CHALLENGE,
  RETRY_BACKOFF_CHALLENGE,
  DEEP_QUERY_FLATTEN_CHALLENGE,
];
