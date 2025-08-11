import Redis from "ioredis";

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 5,
    enableOfflineQueue: false,
    connectTimeout: 10000
});

redisClient.on('connect', () => {
    console.log("Redis connected successfully");
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

export default redisClient;