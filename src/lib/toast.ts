import { toast as sonnerToast } from 'sonner'
import { getErrorMessage } from '../services/api'

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  fromError: (error: unknown, fallback = 'Something went wrong') =>
    sonnerToast.error(getErrorMessage(error) || fallback),
}
