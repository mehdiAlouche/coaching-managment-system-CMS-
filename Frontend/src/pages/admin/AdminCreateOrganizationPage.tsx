import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { apiClient, endpoints } from '@/services'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'

export default function AdminCreateOrganizationPage() {
  const navigate = useNavigate()
  const { handleError, showSuccess } = useErrorHandler()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    billingEmail: '',
    maxUsers: 100,
    subscriptionPlan: 'standard',
    settings: {
      timezone: 'America/New_York',
      locale: 'en-US',
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData((prev) => ({ ...prev, name: value, slug }))
    } else if (name === 'maxUsers') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [name]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await apiClient.post(endpoints.organizationAdmin.create, formData)
      showSuccess('Organization created', 'New organization created successfully')
      navigate({ to: '/admin/organizations' })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Organization</h1>
          <p className="text-muted-foreground mt-2">Add a new organization to the platform</p>
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
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="acme-corp"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">URL-friendly identifier (auto-generated from name)</p>
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
                    placeholder="billing@acme.com"
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
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
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
