import { createFileRoute } from '@tanstack/react-router'
import AdminCreateOrganizationPage from '@/pages/admin/AdminCreateOrganizationPage'

export const Route = createFileRoute('/admin/organizations/create')({
  component: AdminCreateOrganizationPage,
})
