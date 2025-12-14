import { createFileRoute } from '@tanstack/react-router'
import ProfileEditPage from '@/pages/profile/ProfileEditPage'

export const Route = createFileRoute('/_authenticated/profile/edit')({
  component: ProfileEditPage,
})
