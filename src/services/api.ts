import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface BackendSuccess<T> {
  success: true
  data: T
  message: string
}

interface BackendFailure {
  success: false
  message: string
  error?: { code: string }
}

api.interceptors.response.use(
  (response) => {
    const body = response.data as BackendSuccess<unknown>
    // Unwrap {success, data, message} so services/hooks work with plain data.
    response.data = body?.data
    return response
  },
  (error: AxiosError<BackendFailure>) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data
    const apiError: ApiError = {
      message: body?.message || 'Something went wrong',
      code: body?.error?.code || 'UNKNOWN_ERROR',
      status,
    }
    return Promise.reject(apiError)
  }
)

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message
  return 'Something went wrong'
}
