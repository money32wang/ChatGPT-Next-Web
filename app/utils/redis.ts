import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  // url: env.UPSTASH_REDIS_REST_URL,
  // token: env.UPSTASH_REDIS_REST_TOKEN,
  url: "https://accepted-sloth-33648.upstash.io",
  token:
    "AYNwACQgMzEzNjQ4ZDEtZGNiYi00MzIxLTllZGQtYjE0YmI1MjdkYjgzNzk0YTEwZWQ3MDhlNGFkMWE5NTI1MmE2ZmU4NTlkNGU=",
});

// Create a new ratelimiter, that allows 30 requests per 10 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "10 s"),
  analytics: true,
});
