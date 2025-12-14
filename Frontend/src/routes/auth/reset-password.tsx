import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

interface ResetPasswordSearchParams {
  token?: string
}

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearchParams => ({
    token: search.token as string | undefined,
  }),
  component: ResetPasswordPage,
})
