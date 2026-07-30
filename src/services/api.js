import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!import.meta.env.VITE_API_URL) {
      return Promise.reject(new Error('No API URL configured. Set VITE_API_URL or use fallback data.'))
    }
    return Promise.reject(error)
  }
)

export default api
