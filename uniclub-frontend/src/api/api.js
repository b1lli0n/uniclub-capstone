const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const requestCache = new Map()

export function toQueryString(params) {
  if (!params) return ''
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null && value !== ''),
  ).toString()
  return search ? `?${search}` : ''
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (token) {
      localStorage.removeItem('token')
      invalidateApiCache()
      window.location.href = '/login'
    }
    throw new Error('Network connection lost')
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token')
        invalidateApiCache()
        window.location.href = '/login'
      }
      const error = new Error(data.message || 'API request failed')
      error.status = response.status
      error.response = response
      error.data = data
      throw error
    }


    return data
  } catch (error) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token')
        invalidateApiCache()
        window.location.href = '/login'
      }
    }
    throw error
  }
}

/**
 * Cached API request with deduplication and TTL.
 * Perfect for high-frequency idempotent GET requests like /profile/me or /my-clubs.
 *
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Fetch options
 * @param {number} ttlMs - Cache time-to-live in milliseconds (default 3500ms)
 */
export async function cachedApiRequest(endpoint, options = {}, ttlMs = 3500) {
  const method = (options.method || 'GET').toUpperCase()
  if (method !== 'GET') {
    return apiRequest(endpoint, options)
  }

  const token = localStorage.getItem('token') || ''
  const cacheKey = `${token}:${endpoint}`
  const now = Date.now()

  const cached = requestCache.get(cacheKey)
  if (cached) {
    // If request is currently in-flight, reuse promise to deduplicate concurrent calls
    if (cached.promise) {
      return cached.promise
    }
    // If cached response is still fresh within TTL, return immediately (0ms)
    if (now - cached.timestamp < ttlMs) {
      return cached.data
    }
  }

  // Create in-flight promise
  const promise = apiRequest(endpoint, options)
    .then((data) => {
      requestCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        promise: null,
      })
      return data
    })
    .catch((err) => {
      // Don't cache failed requests
      requestCache.delete(cacheKey)
      throw err
    })

  requestCache.set(cacheKey, {
    data: null,
    timestamp: now,
    promise,
  })

  return promise
}

/**
 * Invalidate API cache by substring or pattern.
 * If pattern is null, clears entire cache.
 *
 * @param {string|RegExp|null} pattern
 */
export function invalidateApiCache(pattern = null) {
  if (!pattern) {
    requestCache.clear()
    return
  }

  for (const key of requestCache.keys()) {
    if (typeof pattern === 'string' && key.includes(pattern)) {
      requestCache.delete(key)
    } else if (pattern instanceof RegExp && pattern.test(key)) {
      requestCache.delete(key)
    }
  }
}