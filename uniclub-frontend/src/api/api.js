const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
      window.location.href = '/login'
    }
    throw new Error('Mạng đã bị ngắt kết nối')
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
        window.location.href = '/login'
      }
      throw new Error(data.message || 'API request failed')
    }

    return data
  } catch (error) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    throw error
  }
}