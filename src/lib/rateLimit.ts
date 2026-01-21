import { redis } from "./redis";

const RATE_LIMIT_TTL = 60 * 60; // 1 hour in seconds
const MAX_SEARCHES_UNSIGNED = 10;
const RATE_LIMIT_PREFIX = "anon-search:";

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  retryAfterSeconds?: number;
}

export const rateLimitService = {
  // Check if an IP address is allowed to search
  async checkLimit(ip: string): Promise<RateLimitResult> {
    if (!redis) {
      // If Redis is not available, allow the request
      return { allowed: true, remaining: MAX_SEARCHES_UNSIGNED };
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;

    try {
      const count = await redis.get(key);
      const currentCount = count ? parseInt(count, 10) : 0;

      // Key doesn't exist or expired
      if (currentCount < MAX_SEARCHES_UNSIGNED) {
        return {
          allowed: true,
          remaining: MAX_SEARCHES_UNSIGNED - currentCount,
        };
      }

      const ttl = await redis.ttl(key);
      // Key exists, user is rate limited
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: ttl > 0 ? ttl : RATE_LIMIT_TTL,
      };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // Fail open - allow request if Redis errors
      return { allowed: true };
    }
  },

  async recordSearch(ip: string): Promise<void> {
    if (!redis) {
      return;
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;

    try {
      const exists = await redis.exists(key);
      if (exists) {
        await redis.incr(key);
      } else {
        await redis.set(key, "1", "EX", RATE_LIMIT_TTL);
      }
    } catch (error) {
      console.error("Rate limit record error:", error);
    }
  },

  // Clear rate limit for an IP

  async clearLimit(ip: string): Promise<void> {
    if (!redis) {
      return;
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;

    try {
      await redis.del(key);
    } catch (error) {
      console.error("Rate limit clear error:", error);
    }
  },
};
