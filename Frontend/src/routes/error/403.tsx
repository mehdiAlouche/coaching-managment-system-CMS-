import { createFileRoute } from '@tanstack/react-router'
import AccessDeniedPage from '@/pages/error/AccessDeniedPage'

export const Route = createFileRoute('/error/403')({
  component: AccessDeniedPage,
})
