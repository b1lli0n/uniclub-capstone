const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function fetchDemoApi() {
  const response = await fetch(`${API_BASE_URL}/api/v1/demo`)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
