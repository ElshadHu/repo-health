import { redis } from "./redis";

const RATE_LIMIT_TTL = 60 * 60; // 1 hour in seconds
const RATE_LIMIT_PREFIX = "anon-search:";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export const rateLimitService = {
  // Check if an IP address is allowed to search
  // Returns allowed: true if no previous search found
  // Returns allowed: false with retryAfterSeconds if rate limited
  async checkLimit(ip: string): Promise<RateLimitResult> {
    if (!redis) {
      // If Redis is not available, allow the request
      return { allowed: true };
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;

    try {
      const ttl = await redis.ttl(key);

      // Key doesn't exist or expired
      if (ttl <= 0) {
        return { allowed: true };
      }

      // Key exists, user is rate limited
      return {
        allowed: false,
        retryAfterSeconds: ttl,
      };
    } catch (error) {
      console.error("Rate limit check error:", error);
      // Fail open - allow request if Redis errors
      return { allowed: true };
    }
  },

  // Record that an IP address has made a search
  // Sets a key with 1 hour TTL

  async recordSearch(ip: string): Promise<void> {
    if (!redis) {
      return;
    }

    const key = `${RATE_LIMIT_PREFIX}${ip}`;

    try {
      await redis.set(key, Date.now().toString(), "EX", RATE_LIMIT_TTL);
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
