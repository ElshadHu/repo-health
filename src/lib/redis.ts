import Redis from "ioredis";
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("REDIS_URL not configured. Caching will be disabled.");
    return null;
  }
  try {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    redis.on("error", (err) => console.error("Redis Client Error:", err));
    redis.on("connect", () => console.log("Redis connected"));
    return redis;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
};
export const redis = getRedisClient();

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Cache get error for key: ${key}`, error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<boolean> {
    if (!redis) return false;
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (error) {
      console.error(`Cache set error for key: ${key}`, error);
      return false;
    }
  },
  async delete(key: string): Promise<boolean> {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key: ${key}`, error);
      return false;
    }
  },
};
