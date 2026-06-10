import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('error', (err) => {
      console.warn('Redis connection error (cache disabled):', err.message);
    });
  }
  return redis;
}

async function isAvailable(): Promise<boolean> {
  try {
    const r = getRedis();
    if (r.status === 'wait') {
      await r.connect();
    }
    return r.status === 'ready';
  } catch {
    return false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    const data = await r.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    const r = getRedis();
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silently fail
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const r = getRedis();
    const keys = await r.keys(pattern);
    if (keys.length > 0) {
      await r.del(...keys);
    }
  } catch {
    // silently fail
  }
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  if (!(await isAvailable())) {
    return fn();
  }

  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  await cacheSet(key, result, ttlSeconds);
  return result;
}
