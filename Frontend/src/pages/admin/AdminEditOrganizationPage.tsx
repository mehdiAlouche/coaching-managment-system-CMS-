import { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { apiClient, endpoints } from '@/services'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface Organization {
  _id: string
  name: string
  slug: string
  isActive: boolean
  settings: {
    timezone: string
    locale: string
  }
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsers: number
  billingEmail: string
  createdAt: string
  updatedAt: string
}

export default function AdminEditOrganizationPage() {
  const { id: orgId } = useParams({ from: '/_authenticated/admin/organizations/$id' })
  const navigate = useNavigate()
  const { handleError, showSuccess } = useErrorHandler()
  const [isLoading, setIsLoading] = useState(false)

  const { data: org, isLoading: isFetching } = useQuery<Organization>({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.organizationAdmin.get(orgId))
      return res.data?.data || res.data
    },
  })

  const [formData, setFormData] = useState<Organization | null>(null)

  useEffect(() => {
    if (org && !formData) {
      setFormData(org)
    }
  }, [org])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return
    const { name, value } = e.target

    if (name === 'isActive') {
      setFormData({ ...formData, [name]: value === 'true' })
    } else if (name === 'maxUsers') {
      setFormData({ ...formData, [name]: Number(value) || 0 })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData({
      ...formData,
      settings: { ...formData.settings, [name]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    setIsLoading(true)
    try {
      await apiClient.patch(endpoints.organizationAdmin.update(orgId), formData)
      showSuccess('Organization updated', 'Changes saved successfully')
      navigate({ to: '/admin/organizations' })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Organization not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Organization</h1>
          <p className="text-muted-foreground mt-2">{formData.name}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Organization name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billingEmail">Billing Email *</Label>
                  <Input
                    id="billingEmail"
                    name="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    required
                    placeholder="billing@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={handleChange}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.settings.timezone}
                    onChange={handleSettingChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="America/Toronto">America/Toronto</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Africa/Casablanca">Africa/Casablanca (Morocco)</option>
                    <option value="Africa/Algiers">Africa/Algiers (Algeria)</option>
                    <option value="Africa/Tunis">Africa/Tunis (Tunisia)</option>
                    <option value="Africa/Cairo">Africa/Cairo (Egypt)</option>
                    <option value="Africa/Tripoli">Africa/Tripoli (Libya)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
                    <option value="Pacific/Auckland">Pacific/Auckland (NZDT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="locale">Locale</Label>
                  <select
                    id="locale"
                    name="locale"
                    value={formData.settings.locale}
                    onChange={handleSettingChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="en-CA">English (Canada)</option>
                    <option value="en-AU">English (Australia)</option>
                    <option value="fr-FR">French (France)</option>
                    <option value="fr-CA">French (Canada)</option>
                    <option value="de-DE">German (Germany)</option>
                    <option value="es-ES">Spanish (Spain)</option>
                    <option value="es-MX">Spanish (Mexico)</option>
                    <option value="it-IT">Italian (Italy)</option>
                    <option value="pt-BR">Portuguese (Brazil)</option>
                    <option value="pt-PT">Portuguese (Portugal)</option>
                    <option value="ja-JP">Japanese (Japan)</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                    <option value="zh-TW">Chinese (Traditional)</option>
                    <option value="ar-SA">Arabic (Saudi Arabia)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscriptionPlan">Subscription Plan *</Label>
                  <select
                    id="subscriptionPlan"
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="starter">Starter</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <select
                    id="isActive"
                    name="isActive"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/admin/organizations' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
