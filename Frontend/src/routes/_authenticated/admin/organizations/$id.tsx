import { createFileRoute } from '@tanstack/react-router'
import AdminEditOrganizationPage from '@/pages/admin/AdminEditOrganizationPage'

export const Route = createFileRoute('/_authenticated/admin/organizations/$id')({
  component: AdminEditOrganizationPage,
})
