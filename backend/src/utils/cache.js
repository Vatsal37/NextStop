import NodeCache from 'node-cache';

const cache = new NodeCache();

export const cacheGetJson = async (key) => {
  const raw = cache.get(key);
  return raw ?? null;
};

export const cacheSetJson = async (key, value, ttlSeconds) => {
  if (ttlSeconds) cache.set(key, value, ttlSeconds);
  else cache.set(key, value);
};

export const cacheDel = async (key) => {
  cache.del(key);
};


