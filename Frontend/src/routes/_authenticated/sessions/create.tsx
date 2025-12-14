import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserRole } from '../../../models'
import CreateSessionPage from '@/pages/session/CreateSessionPage.tsx'

export const Route = createFileRoute('/_authenticated/sessions/create')({
  beforeLoad: async () => {
    const role = localStorage.getItem('auth_role')
    if (role !== UserRole.ADMIN && role !== UserRole.MANAGER) {
      throw redirect({ to: '/' })
    }
  },
  component: CreateSessionPage,
})
